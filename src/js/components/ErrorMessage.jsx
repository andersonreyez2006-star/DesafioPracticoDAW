// Mensaje accesible para errores de países o clima; onRetry es opcional.
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="status error" role="alert">
      ⚠️ {message}
      {onRetry && (
        <button className="retry" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
