// Renderiza los campos descriptivos ya normalizados por src/services/api.js.
export default function CountryInfo({ country }) {
  return (
    <section className="info">
      <img src={country.flagUrl} alt={country.flagAlt || `Bandera de ${country.name.common}`} />
      <div>
        <h2>{country.name.common}</h2>
        <p><b>Nombre oficial:</b> {country.name.official ?? "—"}</p>
        <p><b>Capital:</b> {country.capital ?? "Sin capital"}</p>
        <p><b>Región:</b> {country.region ?? "—"}</p>
        <p><b>Población:</b> {country.population?.toLocaleString("es") ?? "—"}</p>
      </div>
    </section>
  );
}
