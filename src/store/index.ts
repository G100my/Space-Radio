export * from './AlertStore'
import { createStore, createLogger } from 'vuex'
import { PlayingState, LatestOrder, Volume, Vote, Progress } from './PlayingState'
import { Personal } from './Personal'
import { UserLog } from './UserLog'
import { RoomBasic } from './RoomBasic'
import { PersonalPlaylists } from './PersonalPlaylists'
import { NoteDialog } from './NoteDialog'

const mutationExceptions = ['playingProgress', 'pushUserLog']
const actionExceptions = ['updateProgress']

const store = createStore({
  modules: {
    Personal,
    PlayingState,
    LatestOrder,
    Volume,
    Vote,
    Progress,
    UserLog,
    RoomBasic,
    PersonalPlaylists,
    NoteDialog,
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
