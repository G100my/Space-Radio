const utterance = new window.SpeechSynthesisUtterance()
utterance.pitch = 1
utterance.rate = 0.75
utterance.volume = 1
utterance.lang = 'zh-TW'

function setTTSVoice() {
  const voice = speechSynthesis.getVoices().find(item => item.name.includes('Google') && item.lang.includes('zh-TW'))
  if (voice !== null) utterance.voice = voice
}

speechSynthesis.onvoiceschanged = () => {
  if (!utterance.voice) setTTSVoice()
}

function TTS(text) {
  return new Promise((resolve, reject) => {
    utterance.onerror = error => {
      console.error('utterance error: ', error)
      reject()
    }
    utterance.onend = () => {
      console.log('utterance end')
      resolve()
    }
    if (utterance.voice === null) setTTSVoice()
    utterance.text = text
    speechSynthesis.speak(utterance)
  })
}

export { TTS }
