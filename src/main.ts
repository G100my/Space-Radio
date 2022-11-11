import { createApp } from 'vue'
// import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import store from './store/'
import './style/index.css'
import i18n from './i18n'

// prettier-ignore
createApp(App)
  .use(router)
  .use(store)
  // .use(createPinia())
  .use(i18n)
  .mount('#app')
