import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import { fileURLToPath, URL } from 'node:url'

const useDevMode = true

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    qiankun('digital-city', { useDevMode }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@resume/dashboard': fileURLToPath(new URL('../dashboard', import.meta.url)),
    },
  },
  server: {
    port: 5175,
    origin: 'http://localhost:5175',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  optimizeDeps: {
    include: [
      'three',
      'three/examples/jsm/loaders/GLTFLoader.js',
    ],
  },
})
