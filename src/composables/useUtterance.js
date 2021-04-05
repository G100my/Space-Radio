import { resumePlayerVolume } from './useSpotifyPlayer.js'

const utterance = new window.SpeechSynthesisUtterance()
utterance.pitch = 1
utterance.rate = 0.85
utterance.volume = 1
utterance.lang = 'zh-TW'

speechSynthesis.onvoiceschanged = () => {
  if (!utterance.voice) setTTSVoice()
}
utterance.onerror = error => {
  console.log('utterance error: ', error)
  resumePlayerVolume()
}
utterance.onend = () => {
  console.log('utterance end')
  resumePlayerVolume()
}

function setTTSVoice() {
  const voice = speechSynthesis.getVoices().find(item => item.name.includes('Google') && item.lang.includes('zh-TW'))
  if (voice !== null) utterance.voice = voice
}
function TTS(text) {
  if (utterance.voice === null) setTTSVoice()
  utterance.text = text
  speechSynthesis.speak(utterance)
}

export { TTS }
