import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite ejecuta el servidor de desarrollo (`npm run dev`) y empaqueta la app (`npm run build`).
// El build queda en `dist/`; esa carpeta es la que se publica en un hosting estático.
export default defineConfig({
  plugins: [react()],
});
