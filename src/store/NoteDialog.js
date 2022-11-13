import { usePersonalStore } from './PersonalStore'

export const NoteDialog = {
  state: {
    editingNote: {
      sender: localStorage.getItem('spaceradio_senderName') || '',
      recipient: '',
      message: '',
      tts: false,
    },
    noteTrackName: '',
    isDialogOpen: false,
    submitHandler: () => {},
  },
  getters: {
    noteSender(state) {
      return state.editingNote.sender
    },
    noteRecipient(state) {
      return state.editingNote.recipient
    },
    noteMessage(state) {
      return state.editingNote.message
    },
    noteTTS(state) {
      return state.editingNote.tts
    },
    isDialogOpen(state) {
      return state.isDialogOpen
    },
    noteDialogSubmitHandler(state) {
      return () => {
        state.submitHandler(state.editingNote)
      }
    },
    noteTrackName(state) {
      return state.noteTrackName
    },
  },
  mutations: {
    editingNote(state, payload) {
      state.editingNote = { ...state.editingNote, ...payload }
    },
    noteDialogToggler(state, status) {
      state.isDialogOpen = status
    },
    localSenderName(state) {
      const name = state.editingNote.sender
      if (!name) return
      localStorage.setItem('spaceradio_senderName', name)
    },
    submitHandler(state, handler) {
      state.submitHandler = handler
    },
    noteTrackName(state, value) {
      state.noteTrackName = value
    },
  },
  actions: {
    clearNote({ commit, getters }) {
      const name = localStorage.getItem('spaceradio_senderName') || usePersonalStore().display_name
      commit('editingNote', {
        sender: name,
        recipient: '',
        message: '',
      })
    },
  },
}
