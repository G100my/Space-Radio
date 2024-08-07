import { createI18n } from 'vue-i18n'
import en from './en-US.json'
import zh from './zh-TW.json'

export default createI18n({
  locale: 'en',
  fallbackLocale: 'zh-TW',
  legacy: false,
  messages: {
    'en-US': en,
    'zh-TW': zh,
  },
})
