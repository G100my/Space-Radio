import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import './style/index.css'

if (import.meta.env.PROD) {
  window.console.log = () => {}
}

// prettier-ignore
createApp(App)
  .use(router)
  .use(store)
  .mount('#app')
