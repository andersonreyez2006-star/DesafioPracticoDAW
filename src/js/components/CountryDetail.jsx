import CountryInfo from "./CountryInfo.jsx";
import CountryWeather from "./CountryWeather.jsx";

// Panel lateral que agrupa información general y consulta del clima del país seleccionado.
export default function CountryDetail({ country, onClose }) {
  return (
    <aside className="detail">
      <button className="close" onClick={onClose} aria-label="Cerrar detalle">✕</button>
      <CountryInfo country={country} />
      <CountryWeather capital={country.capital} countryCode={country.cca2} latlng={country.latlng} />
    </aside>
  );
}
