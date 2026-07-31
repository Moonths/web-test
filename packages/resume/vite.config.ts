import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun'
import { fileURLToPath, URL } from 'node:url'

const useDevMode = true   // 开发时是否以 qiankun 模式启动

// 生产构建时通过环境变量覆盖 base 路径
// pnpm build:resume 用默认 /resume/；集成构建时设置 VITE_BASE=/subapps/resume/
const prodBase = process.env.VITE_BASE || '/resume/'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? prodBase : '/resume/',
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
    port: 5201,
    origin: 'http://localhost:5201',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
})
