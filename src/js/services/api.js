// FUENTES EXTERNAS: este módulo concentra las URLs y la lógica de comunicación con APIs.
const COUNTRIES_URL = "https://restcountries.com/v3.1/all";
// Respaldo público: se consulta si REST Countries falla o su respuesta no sirve.
const COUNTRIES_BACKUP_URL = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";
// Open-Meteo brinda el pronóstico; su geocodificador solo se usa si faltan coordenadas.
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Descarga y convierte respuestas JSON. Centraliza errores de red, HTTP y formato.
async function getJson(url, signal, service = "el servicio") {
  let response;
  try {
    response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("No se pudo conectar con el servicio. Comprueba tu conexión e inténtalo de nuevo.");
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error("El servicio devolvió una respuesta que no es JSON válido.");
  }

  if (!response.ok) {
    if (response.status === 401) throw new Error(`El servicio de ${service} rechazó la solicitud (401).`);
    if (response.status === 404) throw new Error("No se encontraron datos para esta ubicación.");
    if (response.status === 429) throw new Error("Se alcanzó el límite de solicitudes. Inténtalo más tarde.");
    throw new Error(body?.message || `El servicio respondió con error (${response.status}).`);
  }
  return body;
}

const isString = (value) => typeof value === "string" && value.trim() !== "";
const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

// Validadores de frontera: descartan respuestas externas incompletas antes de renderizarlas.
export const isValidCountry = (country) =>
  country && isString(country.cca3) && isString(country.cca2) &&
  isString(country.name?.common) && isString(country.flagUrl);

export const isValidWeather = (weather) =>
  weather && isNumber(weather.main?.temp) && isNumber(weather.main?.humidity) &&
  isNumber(weather.wind?.speed) && Array.isArray(weather.weather) &&
  isString(weather.weather[0]?.description);

// Convierte tanto el objeto de REST Countries como el de respaldo a un formato interno único.
// De esta manera los componentes no tienen que conocer dos esquemas de API diferentes.
function normalizeCountry(raw) {
  const alpha2 = raw?.cca2;
  return {
    cca2: alpha2,
    cca3: raw?.cca3,
    name: { common: raw?.name?.common, official: raw?.name?.official },
    flagUrl: raw?.flags?.png || raw?.flags?.svg || (isString(alpha2)
      ? `https://flagcdn.com/w320/${alpha2.toLowerCase()}.png`
      : null),
    flagAlt: raw?.flags?.alt || raw?.flag || "",
    capital: Array.isArray(raw?.capital) ? raw.capital[0] ?? null : null,
    region: raw?.region || null,
    population: isNumber(raw?.population) ? raw.population : null,
    latlng: Array.isArray(raw?.latlng) && raw.latlng.length === 2 && raw.latlng.every(isNumber)
      ? raw.latlng
      : null,
  };
}

export async function fetchCountries(signal) {
  // Solicita solo los campos que la interfaz usa y prioriza la API principal.
  const fields = "name,cca2,cca3,flags,capital,region,population,latlng";
  try {
    const body = await getJson(`${COUNTRIES_URL}?fields=${fields}`, signal);
    if (!Array.isArray(body)) throw new Error("El servicio de países devolvió un formato inesperado.");
    const countries = body.map(normalizeCountry).filter(isValidCountry);
    if (countries.length > 0) return countries.sort((a, b) => a.name.common.localeCompare(b.name.common, "es"));
  } catch (error) {
    // La cancelación es intencional y no debe activar otra llamada al respaldo.
    if (error.name === "AbortError") throw error;
  }

  // Si falla la principal, el respaldo conserva el catálogo y la misma interfaz.
  let backup;
  try {
    backup = await getJson(COUNTRIES_BACKUP_URL, signal);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("No se pudieron cargar los países. Revisa tu conexión e inténtalo de nuevo.");
  }
  if (!Array.isArray(backup)) throw new Error("La fuente alternativa de países devolvió un formato inesperado.");
  const countries = backup.map(normalizeCountry).filter(isValidCountry);
  if (countries.length === 0) throw new Error("No se recibieron países válidos del servicio.");
  return countries.sort((a, b) => a.name.common.localeCompare(b.name.common, "es"));
}

export async function fetchWeather({ capital, countryCode, latlng }, signal) {
  // Open-Meteo requiere latitud/longitud. Países normalmente ya traen latlng del catálogo.
  let coordinates = latlng;
  if (!Array.isArray(coordinates) || coordinates.length !== 2 || !coordinates.every(isNumber)) {
    if (!isString(capital)) throw new Error("Este país no tiene coordenadas ni una capital para consultar el clima.");
    // Alternativa para registros sin coordenadas: convertir el nombre de capital a coordenadas.
    const lookup = new URLSearchParams({ name: capital, count: "1", language: "es", format: "json" });
    if (isString(countryCode)) lookup.set("countryCode", countryCode);
    const place = await getJson(`${GEOCODING_URL}?${lookup}`, signal, "geocodificación");
    const result = place?.results?.[0];
    if (!isNumber(result?.latitude) || !isNumber(result?.longitude)) {
      throw new Error(`No se encontraron coordenadas para ${capital}.`);
    }
    coordinates = [result.latitude, result.longitude];
  }

  // `current` pide las cuatro medidas que muestra WeatherCard; el viento se solicita en m/s.
  const params = new URLSearchParams({
    latitude: String(coordinates[0]),
    longitude: String(coordinates[1]),
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    temperature_unit: "celsius",
    wind_speed_unit: "ms",
    timezone: "auto",
  });
  const data = await getJson(`${WEATHER_URL}?${params}`, signal, "clima");
  const current = data?.current;
  if (!isNumber(current?.temperature_2m) || !isNumber(current?.relative_humidity_2m) || !isNumber(current?.wind_speed_10m)) {
    throw new Error("El servicio devolvió datos del clima incompletos o inválidos.");
  }

  // Traducción del código meteorológico WMO que devuelve Open-Meteo a texto en español.
  const descriptions = {
    0: "cielo despejado", 1: "mayormente despejado", 2: "parcialmente nublado", 3: "nublado",
    45: "niebla", 48: "niebla con escarcha", 51: "llovizna ligera", 53: "llovizna moderada",
    55: "llovizna intensa", 56: "llovizna helada ligera", 57: "llovizna helada intensa",
    61: "lluvia ligera", 63: "lluvia moderada", 65: "lluvia intensa", 66: "lluvia helada ligera",
    67: "lluvia helada intensa", 71: "nieve ligera", 73: "nieve moderada", 75: "nieve intensa",
    77: "granizo pequeño", 80: "chubascos ligeros", 81: "chubascos moderados", 82: "chubascos intensos",
    85: "chubascos de nieve ligeros", 86: "chubascos de nieve intensos", 95: "tormenta",
    96: "tormenta con granizo ligero", 99: "tormenta con granizo intenso",
  };
  // Adaptador: transforma la respuesta de Open-Meteo al formato que espera WeatherCard.
  const weather = {
    main: { temp: current.temperature_2m, humidity: current.relative_humidity_2m },
    wind: { speed: current.wind_speed_10m },
    weather: [{ description: descriptions[current.weather_code] || "condiciones variables" }],
  };
  if (!isValidWeather(weather)) throw new Error("El servicio devolvió datos del clima incompletos o inválidos.");
  return weather;
}
