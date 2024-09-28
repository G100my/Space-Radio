import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'

import { GlobalComponentPlugin } from 'shared'

import './index.css'

import { OrugaConfig } from '@oruga-ui/oruga-next'
import '@oruga-ui/theme-oruga/dist/oruga.min.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(GlobalComponentPlugin, {
  snackbar: true,
  alert: true,
  loading: true,
})
app.use(OrugaConfig, {
  dropdown: {
    menuClass: 'bg-tertiary-2/80 absolute bottom-0 whitespace-nowrap px-4 py-3',
    itemClass: 'text-white',
    activeClass: 'bg-tertiary-2/80',
  },
})

app.mount('#app')

console.warn('APP_VERSION:', __APP_VERSION__)
