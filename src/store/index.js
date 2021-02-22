import { createStore, createLogger } from 'vuex'
import { PlayingState, playingStateFirebasePlugin } from './PlayingState.js'
import { Personal } from './Personal.js'
import { UserLog, userLogFirebasePlugin } from './UserLog.js'

const store = createStore({
  modules: {
    Personal,
    PlayingState,
    UserLog,
  },
  plugins: [createLogger(), playingStateFirebasePlugin, userLogFirebasePlugin],
})

export default store
