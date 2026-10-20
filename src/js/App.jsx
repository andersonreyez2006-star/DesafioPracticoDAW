import { useMemo, useState } from "react";
import { useFetch } from "./hooks/useFetch.js";
import { fetchCountries } from "./services/api.js";
import SearchBar from "./components/SearchBar.jsx";
import CountryList from "./components/CountryList.jsx";
import CountryDetail from "./components/CountryDetail.jsx";
import Loader from "./components/Loader.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";

export default function App() {
  // Al montar la página pide el catálogo. `useFetch` administra carga, error y cancelación.
  const {
    data: countries,
    loading,
    error,
    refetch,
  } = useFetch(fetchCountries, []);

  // Estado local de la pantalla: texto escrito en el buscador y código del país seleccionado.
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  // Deriva la lista visible del catálogo sin volver a pedir datos al servidor por cada tecla.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (countries ?? []).filter((country) =>
      country.name.common.toLowerCase().includes(q),
    );
  }, [countries, query]);

  // Se busca en el catálogo completo para que el detalle no desaparezca al filtrar la lista.
  const selectedCountry = countries?.find((c) => c.cca3 === selected);

  // Este JSX es el diseño principal: encabezado/búsqueda, estados de carga/error,
  // lista de resultados y, cuando se selecciona un país, su panel de detalle.
  return (
    <div className="app">
      <header>
        <h1>🌍 Países y Clima</h1>
        <SearchBar value={query} onChange={setQuery} />
      </header>
      <main className={selectedCountry ? "with-detail" : ""}>
        <div>
          {loading && <Loader message="Cargando países..." />}
          {error && <ErrorMessage message={error} onRetry={refetch} />}
          {/* La lista solo se monta después de tener datos. El clic cambia `selected`. */}
          {countries && (
            <CountryList
              countries={filtered}
              selectedCode={selected}
              onSelect={setSelected}
            />
          )}
        </div>
        {selectedCountry && (
          <CountryDetail
            country={selectedCountry}
            onClose={() => setSelected(null)}
          />
        )}
      </main>
    </div>
  );
}
