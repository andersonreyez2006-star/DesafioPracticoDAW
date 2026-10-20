// Campo controlado: el valor vive en App y cada escritura actualiza el filtro.
export default function SearchBar({ value, onChange }) {
  return (
    <input
      className="search"
      type="search"
      placeholder="Buscar país..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Buscar país"
    />
  );
}
