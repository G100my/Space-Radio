import { createI18n } from 'vue-i18n'
import en from './en.js'
import zh from './zh.js'

export default createI18n({
  locale: 'zh',
  fallbackLocale: 'en',
  legacy: false,
  messages: {
    en,
    zh,
  },
})
