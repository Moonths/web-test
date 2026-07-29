import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import {
  renderWithQiankun,
  qiankunWindow,
  type QiankunProps,
} from 'vite-plugin-qiankun/dist/helper'
import App from './App.vue'
import router from './router'
import '@resume/shared/tokens'
import './style.css'

let app: VueApp<Element> | null = null

function render(container?: HTMLElement) {
  const mountNode = container
    ? container.querySelector('#app') || container
    : document.getElementById('app')

  if (!mountNode) return

  app = createApp(App)

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.use(createPinia())
  app.use(router)
  app.use(ElementPlus, { locale: zhCn })
  app.mount(mountNode as HTMLElement)
}

function unmount() {
  app?.unmount()
  app = null
}

renderWithQiankun({
  bootstrap() {
    console.log('[admin] bootstrap')
  },
  mount(props: QiankunProps) {
    console.log('[admin] mount', props)
    render(props.container)
  },
  unmount() {
    console.log('[admin] unmount')
    unmount()
  },
  update(props: QiankunProps) {
    console.log('[admin] update', props)
  },
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
