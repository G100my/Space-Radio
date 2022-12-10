import { usePersonalStore, type Note } from '@/store'
import i18n from '@/locales'

const defaultMessageOutput = i18n.global.t('slogan')

const messageOutputMaker = (note: Note | false, trackName: string): string => {
  if (!note) return defaultMessageOutput

  let { sender, recipient } = note
  const { message } = note
  sender = sender ? sender : usePersonalStore().display_name
  recipient = recipient ? recipient : i18n.global.t('everybody')
  return i18n.global.t('oder_to', { sender, trackName, message, recipient })
}

export { messageOutputMaker }
