// vite.config.js
import { defineConfig } from "file:///Users/vladimirvorobev/Desktop/My%20Projects/FrontendDev/MyProject/react/lavandi/node_modules/vite/dist/node/index.js";
import react from "file:///Users/vladimirvorobev/Desktop/My%20Projects/FrontendDev/MyProject/react/lavandi/node_modules/@vitejs/plugin-react/dist/index.mjs";
import viteImagemin from "file:///Users/vladimirvorobev/Desktop/My%20Projects/FrontendDev/MyProject/react/lavandi/node_modules/vite-plugin-imagemin/dist/index.mjs";
import { copyFileSync } from "fs";
import { resolve } from "path";
var enableImagemin = process.env.VERCEL !== "1" && process.env.CI !== "true" && process.env.SKIP_IMAGEMIN !== "1";
var vite_config_default = defineConfig(({ command }) => ({
  plugins: [
    react(),
    command === "build" && enableImagemin && viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 70 },
      svgo: {
        plugins: [
          { name: "removeViewBox" },
          { name: "removeEmptyAttrs", active: false }
        ]
      }
    }),
    command === "build" && {
      name: "spa-fallback",
      closeBundle() {
        copyFileSync(resolve("dist/index.html"), resolve("dist/404.html"));
      }
    }
  ].filter(Boolean),
  build: {
    minify: "esbuild",
    // или 'terser', если нужно сильнее ужать
    sourcemap: false,
    // отключает карты, экономит вес
    chunkSizeWarningLimit: 500,
    // предупреждение о чанках >500kb
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-icons/fa"],
    dedupe: ["react", "react-dom"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdmxhZGltaXJ2b3JvYmV2L0Rlc2t0b3AvTXkgUHJvamVjdHMvRnJvbnRlbmREZXYvTXlQcm9qZWN0L3JlYWN0L2xhdmFuZGlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy92bGFkaW1pcnZvcm9iZXYvRGVza3RvcC9NeSBQcm9qZWN0cy9Gcm9udGVuZERldi9NeVByb2plY3QvcmVhY3QvbGF2YW5kaS92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvdmxhZGltaXJ2b3JvYmV2L0Rlc2t0b3AvTXklMjBQcm9qZWN0cy9Gcm9udGVuZERldi9NeVByb2plY3QvcmVhY3QvbGF2YW5kaS92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgdml0ZUltYWdlbWluIGZyb20gXCJ2aXRlLXBsdWdpbi1pbWFnZW1pblwiO1xuaW1wb3J0IHsgY29weUZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcblxuY29uc3QgZW5hYmxlSW1hZ2VtaW4gPVxuICBwcm9jZXNzLmVudi5WRVJDRUwgIT09IFwiMVwiICYmXG4gIHByb2Nlc3MuZW52LkNJICE9PSBcInRydWVcIiAmJlxuICBwcm9jZXNzLmVudi5TS0lQX0lNQUdFTUlOICE9PSBcIjFcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQgfSkgPT4gKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgY29tbWFuZCA9PT0gXCJidWlsZFwiICYmXG4gICAgICBlbmFibGVJbWFnZW1pbiAmJlxuICAgICAgdml0ZUltYWdlbWluKHtcbiAgICAgICAgZ2lmc2ljbGU6IHsgb3B0aW1pemF0aW9uTGV2ZWw6IDcgfSxcbiAgICAgICAgb3B0aXBuZzogeyBvcHRpbWl6YXRpb25MZXZlbDogNyB9LFxuICAgICAgICBtb3pqcGVnOiB7IHF1YWxpdHk6IDcwIH0sXG4gICAgICAgIHN2Z286IHtcbiAgICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgICB7IG5hbWU6IFwicmVtb3ZlVmlld0JveFwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwicmVtb3ZlRW1wdHlBdHRyc1wiLCBhY3RpdmU6IGZhbHNlIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIGNvbW1hbmQgPT09IFwiYnVpbGRcIiAmJiB7XG4gICAgICBuYW1lOiBcInNwYS1mYWxsYmFja1wiLFxuICAgICAgY2xvc2VCdW5kbGUoKSB7XG4gICAgICAgIGNvcHlGaWxlU3luYyhyZXNvbHZlKFwiZGlzdC9pbmRleC5odG1sXCIpLCByZXNvbHZlKFwiZGlzdC80MDQuaHRtbFwiKSk7XG4gICAgICB9LFxuICAgIH0sXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICBidWlsZDoge1xuICAgIG1pbmlmeTogXCJlc2J1aWxkXCIsIC8vIFx1MDQzOFx1MDQzQlx1MDQzOCAndGVyc2VyJywgXHUwNDM1XHUwNDQxXHUwNDNCXHUwNDM4IFx1MDQzRFx1MDQ0M1x1MDQzNlx1MDQzRFx1MDQzRSBcdTA0NDFcdTA0MzhcdTA0M0JcdTA0NENcdTA0M0RcdTA0MzVcdTA0MzUgXHUwNDQzXHUwNDM2XHUwNDMwXHUwNDQyXHUwNDRDXG4gICAgc291cmNlbWFwOiBmYWxzZSwgLy8gXHUwNDNFXHUwNDQyXHUwNDNBXHUwNDNCXHUwNDRFXHUwNDQ3XHUwNDMwXHUwNDM1XHUwNDQyIFx1MDQzQVx1MDQzMFx1MDQ0MFx1MDQ0Mlx1MDQ0QiwgXHUwNDREXHUwNDNBXHUwNDNFXHUwNDNEXHUwNDNFXHUwNDNDXHUwNDM4XHUwNDQyIFx1MDQzMlx1MDQzNVx1MDQ0MVxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNTAwLCAvLyBcdTA0M0ZcdTA0NDBcdTA0MzVcdTA0MzRcdTA0NDNcdTA0M0ZcdTA0NDBcdTA0MzVcdTA0MzZcdTA0MzRcdTA0MzVcdTA0M0RcdTA0MzhcdTA0MzUgXHUwNDNFIFx1MDQ0N1x1MDQzMFx1MDQzRFx1MDQzQVx1MDQzMFx1MDQ0NSA+NTAwa2JcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKFwibm9kZV9tb2R1bGVzXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ2ZW5kb3JcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCIsIFwicmVhY3QtaWNvbnMvZmFcIl0sXG4gICAgZGVkdXBlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiXSxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFosU0FBUyxvQkFBb0I7QUFDM2IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sa0JBQWtCO0FBQ3pCLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMsZUFBZTtBQUV4QixJQUFNLGlCQUNKLFFBQVEsSUFBSSxXQUFXLE9BQ3ZCLFFBQVEsSUFBSSxPQUFPLFVBQ25CLFFBQVEsSUFBSSxrQkFBa0I7QUFFaEMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxRQUFRLE9BQU87QUFBQSxFQUM1QyxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZLFdBQ1Ysa0JBQ0EsYUFBYTtBQUFBLE1BQ1gsVUFBVSxFQUFFLG1CQUFtQixFQUFFO0FBQUEsTUFDakMsU0FBUyxFQUFFLG1CQUFtQixFQUFFO0FBQUEsTUFDaEMsU0FBUyxFQUFFLFNBQVMsR0FBRztBQUFBLE1BQ3ZCLE1BQU07QUFBQSxRQUNKLFNBQVM7QUFBQSxVQUNQLEVBQUUsTUFBTSxnQkFBZ0I7QUFBQSxVQUN4QixFQUFFLE1BQU0sb0JBQW9CLFFBQVEsTUFBTTtBQUFBLFFBQzVDO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0gsWUFBWSxXQUFXO0FBQUEsTUFDckIsTUFBTTtBQUFBLE1BQ04sY0FBYztBQUNaLHFCQUFhLFFBQVEsaUJBQWlCLEdBQUcsUUFBUSxlQUFlLENBQUM7QUFBQSxNQUNuRTtBQUFBLElBQ0Y7QUFBQSxFQUNGLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBO0FBQUEsSUFDUixXQUFXO0FBQUE7QUFBQSxJQUNYLHVCQUF1QjtBQUFBO0FBQUEsSUFDdkIsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sYUFBYSxJQUFJO0FBQ2YsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxTQUFTLGFBQWEsZ0JBQWdCO0FBQUEsSUFDaEQsUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLEVBQy9CO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
