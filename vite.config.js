import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteImagemin from "vite-plugin-imagemin";
import { copyFileSync } from "fs";
import { resolve } from "path";

const enableImagemin =
  process.env.VERCEL !== "1" &&
  process.env.CI !== "true" &&
  process.env.SKIP_IMAGEMIN !== "1";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    command === "build" &&
      enableImagemin &&
      viteImagemin({
        gifsicle: { optimizationLevel: 7 },
        optipng: { optimizationLevel: 7 },
        mozjpeg: { quality: 70 },
        svgo: {
          plugins: [
            { name: "removeViewBox" },
            { name: "removeEmptyAttrs", active: false },
          ],
        },
      }),
    command === "build" && {
      name: "spa-fallback",
      closeBundle() {
        copyFileSync(resolve("dist/index.html"), resolve("dist/404.html"));
      },
    },
  ].filter(Boolean),
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
    include: ["react", "react-dom", "react-icons/fa"],
    dedupe: ["react", "react-dom"],
  },
}));
