import { createStore, createLogger } from 'vuex'
import { PlayingState, playingStateFirebasePlugin } from './PlayingState.js'
import { Personal } from './Personal.js'
import { UserLog, userLogFirebasePlugin } from './UserLog.js'
import { FirebaseRef } from './FirebaseRef.js'

const store = createStore({
  modules: {
    FirebaseRef,
    Personal,
    PlayingState,
    UserLog,
  },
  plugins: [createLogger(), playingStateFirebasePlugin, userLogFirebasePlugin],
})

export default store
