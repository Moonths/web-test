import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import { fileURLToPath, URL } from 'node:url'

const useDevMode = true

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    qiankun('dashboard', { useDevMode }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5176,
    origin: 'http://localhost:5176',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
})
