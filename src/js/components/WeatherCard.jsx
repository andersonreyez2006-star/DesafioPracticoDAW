// Presentación del clima; no consulta APIs. Recibe datos listos desde CountryWeather.
export default function WeatherCard({ weather, capital }) {
  const { main, wind } = weather;
  const { description, icon } = weather.weather[0];
  return (
    <section className="weather">
      <h3>Clima actual en {capital}</h3>
      <div className="weather__main">
        {icon && <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt={description} />}
        <strong>{Math.round(main.temp)} °C</strong>
      </div>
      <ul>
        <li>Estado: <span className="cap">{description}</span></li>
        <li>Humedad: {main.humidity}%</li>
        <li>Viento: {(wind.speed * 3.6).toFixed(1)} km/h</li>
      </ul>
    </section>
  );
}
