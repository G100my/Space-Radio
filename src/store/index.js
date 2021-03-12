import { createStore, createLogger } from 'vuex'
import { PlayingState } from './PlayingState.js'
import { Personal } from './Personal.js'
import { UserLog } from './UserLog.js'
import { FirebaseRef } from './FirebaseRef.js'

const store = createStore({
  modules: {
    FirebaseRef,
    Personal,
    PlayingState,
    UserLog,
  },
  plugins: [createLogger()],
})

export default store
