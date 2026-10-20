// Indicador reutilizable que aparece mientras una API está respondiendo.
export default function Loader({ message = "Cargando..." }) {
  return (
    <div className="status loader" role="status" aria-live="polite">
      <span className="spinner" /> {message}
    </div>
  );
}
