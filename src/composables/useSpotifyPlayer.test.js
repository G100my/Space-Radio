require('dotenv').config()
import store from '../store'
import { setNextQueueTimeoutHandler, clearPendingQueueHandler } from './useSpotifyPlayer'
import testPlayingState from '../fakeData/testPlayingStateData'
import { computed } from 'vue'

jest.mock('../store/index.js')
jest.mock('../utility/PKCE.js')
jest.mock('../utility/tts.js')
jest.mock('vue')

describe.only('track flow', () => {
  jest.useFakeTimers('legacy')
  it('只發送一次 store.dispatch("sendNextQueue")', () => {
    const handlerMock = jest.fn(setNextQueueTimeoutHandler)
    testPlayingState.forEach(state => {
      handlerMock(state)
    })
    jest.runOnlyPendingTimers()
    expect(handlerMock).toBeCalledTimes(testPlayingState.length)
    expect(store.dispatch).toBeCalledTimes(1)
    expect(store.dispatch).toBeCalledWith('sendNextQueue')
  })

  const pendingQueue = computed(() => store.getters.pendingQueue)
  expect(pendingQueue.value).toEqual({})
  const handlerMock = jest.fn(clearPendingQueueHandler)

  it('clearPendingQueueHandler, no pending', () => {
    testPlayingState.forEach(state => {
      handlerMock(state, pendingQueue.value)
    })
    expect(store.dispatch).toBeCalledTimes(0)
  })

  it('clearPendingQueueHandler', () => {
    const nextTrackIndex = testPlayingState.findIndex(item => {
      return item.track_window.current_track.id !== testPlayingState[0].track_window.current_track.id
    })
    expect(nextTrackIndex).toBeGreaterThanOrEqual(0)

    const valuesMock = jest.fn()
    valuesMock.mockReturnValue({})

    for (let i = 0; i < nextTrackIndex + 6; i++) {
      const pending = valuesMock()
      handlerMock(testPlayingState[i], pending)
      if (i === nextTrackIndex) {
        valuesMock.mockReturnValue({
          dfsdfsfsfsdf: {
            track_id: testPlayingState[nextTrackIndex].track_window.current_track.id,
          },
        })
      }
    }

    handlerMock(testPlayingState[0], pendingQueue.value)
    expect(store.dispatch).toBeCalledTimes(1)
  })
})
