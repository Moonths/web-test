import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  server: {
    port: 5100,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
})
