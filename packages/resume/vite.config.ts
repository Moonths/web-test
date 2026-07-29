import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import { fileURLToPath, URL } from 'node:url'

const useDevMode = true   // 开发时是否以 qiankun 模式启动

export default defineConfig({
  base: '/resume/',
  plugins: [
    vue(),
    qiankun('resume', { useDevMode }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    origin: 'http://localhost:5173',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
})
