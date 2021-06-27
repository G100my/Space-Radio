import { createStore, createLogger } from 'vuex'
import { PlayingState } from './PlayingState.js'
import { Personal } from './Personal.js'
import { UserLog } from './UserLog.js'
import { RoomBasic } from './RoomBasic.js'

const store = createStore({
  modules: {
    Personal,
    PlayingState,
    UserLog,
    RoomBasic,
  },
  plugins: [createLogger()],
})

export default store
