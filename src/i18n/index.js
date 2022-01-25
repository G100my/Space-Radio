import { createI18n } from 'vue-i18n'
import en from './en.json'
import zh from './zh-TW.json'

export default createI18n({
  locale: 'zh',
  fallbackLocale: 'en',
  legacy: false,
  messages: {
    en,
    zh,
  },
})
