import './index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { OrugaConfig } from '@oruga-ui/oruga-next'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(OrugaConfig, {
  dropdown: {
    menuClass: 'bg-tertiary-2/80 absolute bottom-0 whitespace-nowrap px-4 py-3',
    itemClass: 'text-white',
    activeClass: 'bg-tertiary-2/80',
  },
})

app.mount('#app')
