export * from './AlertStore'
export * from './PersonalStore'
export * from './RoomBasicStore'
export * from './NoteStore'
import { createStore, createLogger } from 'vuex'
import { PlayingState, LatestOrder, Volume, Vote, Progress } from './PlayingState'
import { UserLog } from './UserLog'
import { PersonalPlaylists } from './PersonalPlaylists'

const mutationExceptions = ['playingProgress', 'pushUserLog']
const actionExceptions = ['updateProgress']

const store = createStore({
  modules: {
    PlayingState,
    LatestOrder,
    Volume,
    Vote,
    Progress,
    UserLog,
    PersonalPlaylists,
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
