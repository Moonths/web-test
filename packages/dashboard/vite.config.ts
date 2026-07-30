import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import { fileURLToPath, URL } from 'node:url'

const useDevMode = true

// 生产构建时通过环境变量覆盖 base 路径
const prodBase = process.env.VITE_BASE || '/subapps/dashboard/'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? prodBase : '/',
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
