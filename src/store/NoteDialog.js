export const NoteDialog = {
  state: {
    editingNote: {
      sender: localStorage.getItem('jukebox_senderName') || '',
      recipient: '',
      message: '',
    },
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
    isDialogOpen(state) {
      return state.isDialogOpen
    },
    noteDialogSubmitHandler(state) {
      return () => {
        state.submitHandler(state.editingNote)
      }
    },
  },
  mutations: {
    refreshNote(state, payload) {
      state.editingNote = { ...state.editingNote, ...payload }
    },
    noteDialogToggler(state, status) {
      state.isDialogOpen = status
    },
    _refreshLocalSenderName(state) {
      const name = state.editingNote.sender
      if (!name) return
      localStorage.setItem('jukebox_senderName', name)
    },
    _refreshHandler(state, handler) {
      state.submitHandler = handler
    },
  },
  actions: {
    _clearNote({ commit, getters }) {
      const name = localStorage.getItem('jukebox_senderName') || getters.userName
      commit('refreshNote', {
        sender: name,
        recipient: '',
        message: '',
      })
    },
  },
}
