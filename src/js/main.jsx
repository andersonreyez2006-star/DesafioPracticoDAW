import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "../css/App.css";

// PUNTO DE MONTAJE DEL RENDER:
// index.html contiene <div id="root">. React crea aquí el árbol de componentes,
// comenzando por <App />. El navegador renderiza el resultado en el DOM visible.
// En desarrollo Vite lo sirve desde su servidor local; `npm run build` genera
// los archivos estáticos equivalentes dentro de la carpeta `dist/`.
createRoot(document.getElementById("root")).render(<App />);
