const utterance = new window.SpeechSynthesisUtterance()
utterance.pitch = 1
utterance.rate = 0.85
utterance.volume = 1
utterance.lang = 'zh-TW'

speechSynthesis.onvoiceschanged = () => {
  if (!utterance.voice) setTTSVoice()
}

export { utterance, setTTSVoice }

function setTTSVoice() {
  const voice = speechSynthesis.getVoices().find(item => item.name.includes('Google') && item.lang.includes('zh-TW'))
  if (voice !== null) utterance.voice = voice
}
