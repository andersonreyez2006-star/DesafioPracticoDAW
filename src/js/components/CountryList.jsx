import CountryCard from "./CountryCard.jsx";

// Convierte el arreglo filtrado en tarjetas. Es hijo de App y no realiza peticiones.
export default function CountryList({ countries, selectedCode, onSelect }) {
  if (countries.length === 0) return <p className="status">No se encontraron países.</p>;
  return (
    <div className="grid">
      {countries.map((c) => (
        <CountryCard key={c.cca3} country={c} selected={c.cca3 === selectedCode} onSelect={onSelect} />
      ))}
    </div>
  );
}
