// vite.config.ts
import { defineConfig } from "file:///Users/maojike/resume-website/node_modules/.pnpm/vite@5.2.11/node_modules/vite/dist/node/index.js";
import vue from "file:///Users/maojike/resume-website/node_modules/.pnpm/@vitejs+plugin-vue@5.0.4_vite@5.2.11_vue@3.5.40_typescript@5.4.5_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import qiankun from "vite-plugin-qiankun";
import { fileURLToPath, URL } from "node:url";
var __vite_injected_original_import_meta_url = "file:///Users/maojike/resume-website/packages/resume/vite.config.ts";
var useDevMode = true;
var vite_config_default = defineConfig({
  base: "/resume/",
  plugins: [
    vue(),
    qiankun("resume", { useDevMode })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  server: {
    port: 5173,
    origin: "http://localhost:5173",
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWFvamlrZS9yZXN1bWUtd2Vic2l0ZS9wYWNrYWdlcy9yZXN1bWVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYW9qaWtlL3Jlc3VtZS13ZWJzaXRlL3BhY2thZ2VzL3Jlc3VtZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbWFvamlrZS9yZXN1bWUtd2Vic2l0ZS9wYWNrYWdlcy9yZXN1bWUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgcWlhbmt1biBmcm9tICd2aXRlLXBsdWdpbi1xaWFua3VuJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmNvbnN0IHVzZURldk1vZGUgPSB0cnVlICAgLy8gXHU1RjAwXHU1M0QxXHU2NUY2XHU2NjJGXHU1NDI2XHU0RUU1IHFpYW5rdW4gXHU2QTIxXHU1RjBGXHU1NDJGXHU1MkE4XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJhc2U6ICcvcmVzdW1lLycsXG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICBxaWFua3VuKCdyZXN1bWUnLCB7IHVzZURldk1vZGUgfSksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBvcmlnaW46ICdodHRwOi8vbG9jYWxob3N0OjUxNzMnLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgfSxcbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlULFNBQVMsb0JBQW9CO0FBQ3RWLE9BQU8sU0FBUztBQUNoQixPQUFPLGFBQWE7QUFDcEIsU0FBUyxlQUFlLFdBQVc7QUFIK0osSUFBTSwyQ0FBMkM7QUFLblAsSUFBTSxhQUFhO0FBRW5CLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFFBQVEsVUFBVSxFQUFFLFdBQVcsQ0FBQztBQUFBLEVBQ2xDO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLE1BQ1AsK0JBQStCO0FBQUEsSUFDakM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
