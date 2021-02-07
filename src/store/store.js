import { createStore, createLogger } from 'vuex'
import { Queue, queueFirebasePlugin } from './Queue.js'
import { PlayingState, playingStateFirebasePlugin } from './PlayingState.js'
import { Personal } from './Personal.js'

const store = createStore({
  modules: {
    Personal,
    PlayingState,
    Queue,
  },
  plugins: [createLogger(), queueFirebasePlugin, playingStateFirebasePlugin],
})

export default store
