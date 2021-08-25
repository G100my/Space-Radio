import { createStore, createLogger } from 'vuex'
import { PlayingState, LatestOrder, Volume, Vote, Progress } from './PlayingState.js'
import { Personal } from './Personal.js'
import { UserLog } from './UserLog.js'
import { RoomBasic } from './RoomBasic.js'
import { PersonalPlaylists } from './PersonalPlaylists.js'
import { FeedbackAlert } from './FeedbackAlert.js'
import { NoteDialog } from './NoteDialog.js'

const mutationExceptions = ['_refreshProgress', 'pushUserLog']
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
    FeedbackAlert,
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
