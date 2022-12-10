import { watch, type WatchStopHandle } from 'vue'
import { messageOutputMaker } from '@/utility/messageOutputMaker'
import { useQueueStore } from '@/store'
import type { Order } from '@/prototype/Order'

const utterance = new window.SpeechSynthesisUtterance()
utterance.pitch = 1
utterance.rate = 0.75
utterance.volume = 1
utterance.lang = 'zh-TW'

export function setTTSVoice() {
  const voice = speechSynthesis.getVoices().find(item => item.name.includes('Google') && item.lang.includes('zh-TW'))
  if (voice) utterance.voice = voice
}

if (!speechSynthesis.onvoiceschanged) {
  speechSynthesis.onvoiceschanged = () => {
    if (!utterance.voice) setTTSVoice()
  }
}

export function TTS(text: string) {
  return new Promise<void>((resolve, reject) => {
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

export function TTSbyNote(pending: Order) {
  const { track_name, note } = pending
  let messageOutput4TTS = messageOutputMaker(note, track_name)
  messageOutput4TTS = messageOutput4TTS.replace(/[^\w^\s^\u4e00-\u9fa5]/gi, '')
  return TTS(messageOutput4TTS)
}

let unwatch: WatchStopHandle | null = null

export function useTTSonPlayer(reducePlayerVolume: () => Promise<void>, resumePlayerVolume: () => Promise<void>) {
  if (!unwatch) {
    unwatch = watch(
      () => useQueueStore().pendingOrder,
      pending => {
        console.log(pending)
        if (!pending) return
        else if (!pending.note) return
        else if (!pending.note.tts) return
        else {
          reducePlayerVolume()
            .then(() => {
              TTSbyNote(pending)
            })
            .then(() => resumePlayerVolume())
            .catch(error => {
              console.error(error)
            })
        }
      },
      { deep: true }
    )
  }
  return () => {
    if (unwatch) {
      unwatch()
      unwatch = null
    } else {
      throw new Error("useTTSwatch did't watch any thing.")
    }
  }
}
