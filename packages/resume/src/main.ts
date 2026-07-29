import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import {
  renderWithQiankun,
  qiankunWindow,
  type QiankunProps,
} from 'vite-plugin-qiankun/dist/helper'
import App from './App.vue'
import '@resume/shared/tokens'
import './assets/css/variables.css'
import './assets/css/main.css'
import './assets/css/ai-chat.css'
import './assets/css/responsive.css'

let app: VueApp<Element> | null = null

function render(container?: HTMLElement) {
  const mountNode = container
    ? container.querySelector('#app') || container
    : document.getElementById('app')

  if (!mountNode) return

  app = createApp(App)
  app.use(createPinia())
  app.mount(mountNode as HTMLElement)
}

function unmount() {
  app?.unmount()
  app = null
}

renderWithQiankun({
  bootstrap() {
    console.log('[resume] bootstrap')
  },
  mount(props: QiankunProps) {
    console.log('[resume] mount', props)
    render(props.container)
  },
  unmount() {
    console.log('[resume] unmount')
    unmount()
  },
  update(props: QiankunProps) {
    console.log('[resume] update', props)
  },
})

// 独立运行时直接渲染
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
