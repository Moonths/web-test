import {
  registerMicroApps,
  start,
  addGlobalUncaughtErrorHandler,
  type MicroApp,
} from 'qiankun'

const apps = [
  {
    name: 'resume',
    entry: '//localhost:5173',
    container: '#subapp-viewport',
    activeRule: '/resume',
  },
  {
    name: 'digital-city',
    entry: '//localhost:5175',
    container: '#subapp-viewport',
    activeRule: '/city',
  },
  {
    name: 'dashboard',
    entry: '//localhost:5176',
    container: '#subapp-viewport',
    activeRule: '/dashboard',
  },
  {
    name: 'admin',
    entry: '//localhost:5174',
    container: '#subapp-viewport',
    activeRule: '/admin',
  },
]

export function startQiankun() {
  registerMicroApps(apps, {
    beforeLoad: [async (app: MicroApp) => {
      console.log(`[portal] beforeLoad: ${app.name}`)
      return Promise.resolve()
    }],
    beforeMount: [async (app: MicroApp) => {
      console.log(`[portal] beforeMount: ${app.name}`)
      return Promise.resolve()
    }],
    afterUnmount: [async (app: MicroApp) => {
      console.log(`[portal] afterUnmount: ${app.name}`)
      return Promise.resolve()
    }],
  })

  addGlobalUncaughtErrorHandler((event) => {
    console.error('[portal] qiankun error:', event)
  })

  start({
    sandbox: {
      experimentalStyleIsolation: true,
    },
    prefetch: 'afterFirstMounted',
  })

  console.log('[portal] qiankun started with apps:', apps.map(a => a.name).join(', '))
}
