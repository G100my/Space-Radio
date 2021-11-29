import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import './style/index.css'
import i18n from './i18n'

if (import.meta.env.PROD) {
  window.console.log = () => {}
}

// prettier-ignore
createApp(App)
  .use(router)
  .use(store)
  .use(i18n)
  .mount('#app')
