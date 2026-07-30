 import { createApp } from 'vue'
 import { createPinia } from 'pinia'
 import App from './App.vue'
 import '@resume/shared/tokens'
 import './assets/css/variables.css'
 import './assets/css/main.css'
 import './assets/css/ai-chat.css'
 import './assets/css/responsive.css'
 
 createApp(App).use(createPinia()).mount('#app')
