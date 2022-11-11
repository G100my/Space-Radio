import store from '@/store'
import i18n from '@/locales'

const defaultMessageOutput = i18n.global.t('slogan')

const messageOutputMaker = (note, trackName) => {
  if (!note) return defaultMessageOutput

  let { sender, recipient, message } = note
  sender = sender ? sender : store.getters.userName
  recipient = recipient ? recipient : i18n.global.t('everybody')
  return i18n.global.t('oder_to', { sender, trackName, message, recipient })
}

export { messageOutputMaker }
