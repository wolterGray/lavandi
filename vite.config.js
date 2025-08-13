import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import viteImagemin from "vite-plugin-imagemin";

export default defineConfig({
  base: "/lavandi/",
  plugins: [
    react(),
    viteImagemin({
      gifsicle: {optimizationLevel: 7},
      optipng: {optimizationLevel: 7},
      mozjpeg: {quality: 70},
      svgo: {
        plugins: [
          {name: "removeViewBox"},
          {name: "removeEmptyAttrs", active: false},
        ],
      },
    }),
  ],
  build: {
    minify: "esbuild", // или 'terser', если нужно сильнее ужать
    sourcemap: false, // отключает карты, экономит вес
    chunkSizeWarningLimit: 500, // предупреждение о чанках >500kb
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    dedupe: ["react", "react-dom"],
  },
});
