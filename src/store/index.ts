export * from './AlertStore'
export * from './PersonalStore'
export * from './RoomBasicStore'
export * from './NoteStore'
export * from './PersonalPlaylists'
export * from './PlayingStateStore'
export * from './QueueStore'
import { createStore, createLogger } from 'vuex'
import { UserLog } from './UserLog'

const mutationExceptions = ['playingProgress', 'pushUserLog']
const actionExceptions = ['updateProgress']

const store = createStore({
  modules: {
    UserLog,
  },
  plugins: [
    createLogger({
      filter(mutation) {
        return !mutationExceptions.includes(mutation.type)
      },
      actionFilter(action) {
        return !actionExceptions.includes(action.type)
      },
    }),
  ],
})

export default store
