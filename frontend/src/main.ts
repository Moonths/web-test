import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/css/variables.css'
import './assets/css/main.css'
import './assets/css/ai-chat.css'
import './assets/css/responsive.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
