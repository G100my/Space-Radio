import { defineStore } from 'pinia'
import { usePersonalStore } from './PersonalStore'
import type { OrderRaw } from './PlayingStateStore'

const initNote = {
  sender: localStorage.getItem('spaceradio_senderName') || '',
  recipient: '',
  message: '',
  tts: false,
}

export type Note = typeof initNote

export const useNoteStore = defineStore('NoteStore', {
  state: (): {
    editingNote: Note
    noteTrackName: string
    isDialogOpen: boolean
    submitHandler: (note: Note) => void
  } => ({
    editingNote: { ...initNote },
    noteTrackName: '',
    isDialogOpen: false,
    submitHandler: () => {},
  }),
  actions: {
    updateEditingNote(payload: Partial<Note>) {
      this.editingNote = { ...this.editingNote, ...payload }
    },
    recordSenderNameInLocal() {
      const name = this.editingNote.sender
      if (!name) return
      localStorage.setItem('spaceradio_senderName', name)
    },
    clearNote() {
      const name = localStorage.getItem('spaceradio_senderName') || usePersonalStore().display_name
      this.editingNote = { sender: name ?? '', recipient: '', message: '', tts: false }
    },
  },
})
