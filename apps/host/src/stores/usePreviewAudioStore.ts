import { defineStore } from 'pinia'

export default defineStore('previewAudio', {
  state: () => ({
    audio: new Audio(),
    currentPlaying: '' as string | null,
  }),
  actions: {
    toggle(track: { uri: string; preview_url?: string | null | undefined }) {
      if (this.currentPlaying === track.uri) {
        this.audio.pause()
        this.currentPlaying = ''
      } else {
        if (this.currentPlaying) this.audio.pause()
        if (!track.preview_url) return
        this.audio.src = track.preview_url
        this.audio.play()
        this.currentPlaying = track.uri
      }
    },
  },
})
