import { usePersonalStore } from '@/store'
import i18n from '@/locales'

const defaultMessageOutput = i18n.global.t('slogan')

const messageOutputMaker = (note: unknown, trackName: string) => {
  if (!note) return defaultMessageOutput

  let { sender, recipient, message } = note
  sender = sender ? sender : usePersonalStore().display_name
  recipient = recipient ? recipient : i18n.global.t('everybody')
  return i18n.global.t('oder_to', { sender, trackName, message, recipient })
}

export { messageOutputMaker }
