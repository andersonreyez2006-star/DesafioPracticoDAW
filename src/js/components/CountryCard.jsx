// Tarjeta individual de la cuadrícula. Recibe el país y avisa al padre al seleccionarlo.
export default function CountryCard({ country, selected, onSelect }) {
  const { cca3, name, flagUrl, flagAlt } = country;
  return (
    <button
      className={`card ${selected ? "card--selected" : ""}`}
      onClick={() => onSelect(cca3)}
      aria-pressed={selected}
    >
      <img src={flagUrl} alt={flagAlt || `Bandera de ${name.common}`} loading="lazy" />
      <span>{name.common}</span>
    </button>
  );
}
