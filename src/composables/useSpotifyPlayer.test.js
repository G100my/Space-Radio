require('dotenv').config()
import { expect, jest } from '@jest/globals'
import store from '../store/index.js'
import { setNextQueueTimeoutHandler } from './useSpotifyPlayer'
import testPlayingState from '../fakeData/testPlayingStateData'

jest.mock('../store/index.js')
jest.mock('../utility/PKCE.js')
jest.mock('../utility/tts.js')

describe('track flow', () => {
  const handlerMock = jest.fn(setNextQueueTimeoutHandler)
  jest.useFakeTimers('legacy')

  it('只發送一次 store.dispatch("sendNextQueue")', () => {
    let dispatchCounter = 0
    for (let i = 0; i < testPlayingState.length; i++) {
      const state = testPlayingState[i]
      handlerMock(state)
      if (state.action === 'new track') {
        dispatchCounter++
      }
      if (testPlayingState[i].action) jest.runOnlyPendingTimers()
    }

    expect(store.getters.counter).toBe(dispatchCounter)
  })
})
