import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { startQiankun } from './micro-apps'
import '@resume/shared/tokens'
import './styles/portal.css'

const app = createApp(App)
app.use(router)

// 等初始导航完成后再挂载并启动 qiankun：
// 直接打开 /city 这类子应用路由时，路由组件是懒加载的，
// 若先 mount 再 start，qiankun 在 LOADING_SOURCE_CODE 阶段会找不到
// #subapp-viewport 容器（SubAppView 还没渲染），子应用直接加载失败。
router.isReady().then(() => {
  app.mount('#portal-root')
  startQiankun()
})
