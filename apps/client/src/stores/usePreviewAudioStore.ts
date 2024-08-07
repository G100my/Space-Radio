import { defineStore } from 'pinia'

export default defineStore('previewAudio', {
  state: () => ({
    audio: new Audio(),
    currentPlaying: '',
  }),
  actions: {
    toggle(track: Pick<SpotifyApi.TrackObjectSimplified, 'uri' | 'preview_url'>) {
      if (this.currentPlaying === track.uri) {
        this.audio.pause()
        this.currentPlaying = ''
      } else {
        if (this.currentPlaying) this.audio.pause()
        this.audio.src = track.preview_url!
        this.audio.play()
        this.currentPlaying = track.uri
      }
    },
  },
})
