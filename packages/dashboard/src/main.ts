import { createApp, type App as VueApp } from 'vue'
import {
  renderWithQiankun,
  qiankunWindow,
  type QiankunProps,
} from 'vite-plugin-qiankun/dist/helper'
import App from './App.vue'
import '@resume/shared/tokens'

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
  bootstrap() { console.log('[dashboard] bootstrap') },
  mount(props: QiankunProps) {
    console.log('[dashboard] mount')
    render(props.container)
  },
  unmount() {
    console.log('[dashboard] unmount')
    unmount()
  },
  update(props: QiankunProps) {
    console.log('[dashboard] update', props)
  },
})

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render()
}
