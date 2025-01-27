import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import dayjs from 'dayjs'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(dayjs)

app.mount('#app')
