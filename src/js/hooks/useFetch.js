import { useCallback, useEffect, useState } from "react";

/**
 * Capa común para las peticiones HTTP que usa la interfaz.
 * Devuelve los datos, el indicador de carga, el mensaje de error y `refetch` para reintentar.
 * `deps` identifica los argumentos que cambian la consulta (por ejemplo, el país elegido).
 * Si `fetcher` es null no consulta. AbortController cancela peticiones viejas al cambiar
 * de país o desmontar el componente, evitando que una respuesta tardía pise datos nuevos.
 */
export function useFetch(fetcher, deps = []) {
  // `state` es el estado de red que consumen App y CountryWeather.
  const [state, setState] = useState({ data: null, loading: !!fetcher, error: null });
  // Incrementar attempt vuelve a ejecutar el efecto y, por tanto, hace un reintento real.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!fetcher) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    // `fetcher` es fetchCountries o fetchWeather; recibe signal para poder cancelarse.
    fetcher(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => {
        if (e.name === "AbortError") return;
        setState({ data: null, loading: false, error: e.message || "Error desconocido." });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  // El botón Reintentar llama esta función para disparar otra ejecución del efecto.
  const refetch = useCallback(() => setAttempt((count) => count + 1), []);
  return { ...state, refetch };
}
