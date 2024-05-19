import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style/index.css'
import i18n from './locales'

// prettier-ignore
createApp(App)
  .use(router)
  .use(createPinia())
  .use(i18n)
  .mount('#app')
