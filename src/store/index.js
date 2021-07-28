import { createStore, createLogger } from 'vuex'
import { PlayingState } from './PlayingState.js'
import { Personal } from './Personal.js'
import { UserLog } from './UserLog.js'
import { RoomBasic } from './RoomBasic.js'
import { PersonalPlaylists } from './PersonalPlaylists.js'
import { FeedbackAlert } from './FeedbackAlert.js'

const store = createStore({
  modules: {
    Personal,
    PlayingState,
    UserLog,
    RoomBasic,
    PersonalPlaylists,
    FeedbackAlert,
  },
  plugins: [createLogger()],
})

export default store
