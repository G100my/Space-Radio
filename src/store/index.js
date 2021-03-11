import { createStore, createLogger } from 'vuex'
import { PlayingState, playingStateConnect2firebase } from './PlayingState.js'
import { Personal } from './Personal.js'
import { UserLog, userLogConnect2firebase } from './UserLog.js'
import { FirebaseRef } from './FirebaseRef.js'

const store = createStore({
  modules: {
    FirebaseRef,
    Personal,
    PlayingState,
    UserLog,
  },
  plugins: [createLogger(), playingStateConnect2firebase, userLogConnect2firebase],
})

export default store
