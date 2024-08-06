import './index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import '@/plugins/firebase'
import { GlobalComponentPlugin } from 'shared'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(GlobalComponentPlugin, { snackbar: true })

app.mount('#app')

console.warn('APP_VERSION:', __APP_VERSION__)
