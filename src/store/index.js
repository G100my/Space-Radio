import { createStore, createLogger } from 'vuex'
import { PlayingState, playingStateFirebasePlugin } from './PlayingState.js'
import { Personal } from './Personal.js'

const store = createStore({
  modules: {
    Personal,
    PlayingState,
  },
  plugins: [createLogger(), playingStateFirebasePlugin],
})

export default store
