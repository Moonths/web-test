import { createApp, type App as VueApp } from 'vue'
import {
  renderWithQiankun,
  qiankunWindow,
  type QiankunProps,
} from 'vite-plugin-qiankun/dist/helper'
import App from './App.vue'
import '@resume/shared/tokens'
import './styles/exhibition.css'

let app: VueApp<Element> | null = null

function render(container?: HTMLElement) {
  const mountNode = container
    ? container.querySelector('#app') || container
    : document.getElementById('app')

  if (!mountNode) return

  app = createApp(App)
  app.mount(mountNode as HTMLElement)
}

function unmount() {
  app?.unmount()
  app = null
}

renderWithQiankun({
  bootstrap() { console.log('[digital-city] bootstrap') },
  mount(props: QiankunProps) {
    console.log('[digital-city] mount')
    render(props.container)
  },
  unmount() {
    console.log('[digital-city] unmount')
    unmount()
  },
  update(props: QiankunProps) {
    console.log('[digital-city] update', props)
  },
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
