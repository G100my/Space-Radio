import store from '../store'

const defaultMessageOutput = 'Share you like, enjoy your life.'

const messageOutputMaker = (note, trackName) => {
  if (!note) return defaultMessageOutput

  const { sender, recipient, message } = note
  const senderOutput = sender ? sender : store.getters.userName
  const recipientOutput = recipient ? recipient : '所有人'
  return `${senderOutput} 點播了一首 ${trackName} 給 ${recipientOutput}, ${message}`
}

export { messageOutputMaker }
