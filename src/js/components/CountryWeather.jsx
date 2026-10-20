import { useFetch } from "../hooks/useFetch.js";
import { fetchWeather } from "../services/api.js";
import Loader from "./Loader.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import WeatherCard from "./WeatherCard.jsx";

// Controla la consulta del clima del país actual y selecciona qué estado mostrar:
// sin capital, cargando, error con reintento o tarjeta con datos exitosos.
export default function CountryWeather({ capital, countryCode, latlng }) {
  const { data, loading, error, refetch } = useFetch(
    capital || latlng ? (signal) => fetchWeather({ capital, countryCode, latlng }, signal) : null,
    [capital, countryCode, latlng]
  );

  if (!capital) return <p className="status">Este país no tiene capital registrada.</p>;
  if (loading) return <Loader message="Consultando el clima..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  return <WeatherCard weather={data} capital={capital} />;
}
