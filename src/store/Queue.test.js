import {
  actions,
  mutations,
  state as initState,
  getters as initGetters,
  pending_queue_ref,
  normal_queue_ref,
  getters,
} from './Queue'
import { Order } from '@/prototype/Order'
import { spotifyAPI } from '@/utility/spotifyAPI'

jest.mock('./firebase.js')
jest.mock('../utility/spotifyAPI.js')

const order = new Order({
  orderer_id: 'g100',
  orderer_name: 'g100my',
  track_name: 'lalala',
  track_id: '21wqedfvrt',
})

function getObjectLength(obj) {
  return Object.keys(obj).length
}
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

describe('mutations', () => {
  it('_addOrder', () => {
    const state = deepCopy(initState)

    mutations._addOrder(state, { storeTarget: 'normal', order })
    expect(Object.keys(state.normal_queue).length).toBe(1)
    expect(state.normal_queue[order.id]).toEqual(order)
  })
})

describe('sendNextQueue', () => {
  it('no queue', () => {
    const state = deepCopy(initState)
    expect(state.normal_queue).toEqual({})

    pending_queue_ref.set = jest.fn()

    const getters = deepCopy(initGetters)
    getters._nextOrder = initGetters._nextOrder(state)
    expect(getters._nextOrder).toBeFalsy()

    actions.sendNextQueue({ state, getters })
    expect(pending_queue_ref.set).toHaveBeenCalledWith(null)
  })

  const state = deepCopy(initState)
  it('has normal queue', () => {
    ;[1, 2, 3].forEach(num => {
      const order = new Order({
        orderer_id: `orderer_id${num}`,
        orderer_name: `orderer_name${num}`,
        track_id: `track_id${num}`,
        track_name: `track_name${num}`,
      })
      mutations._addOrder(state, { storeTarget: 'normal', order })
    })
    expect(getObjectLength(state.normal_queue)).toBe(3)
    pending_queue_ref.set = jest.fn()

    spotifyAPI.queue = jest.fn((uri, callback) => {
      callback()
    })

    const getters = deepCopy(initGetters)
    getters._nextOrder = initGetters._nextOrder(state)

    const dispatch = jest.fn(() => {})
    actions.sendNextQueue({ state, getters, dispatch })
    const nextOrder = state.normal_queue[getters._nextOrder.nextOrderId]
    expect(dispatch).toBeCalledTimes(1)
    expect(dispatch).toBeCalledWith('_addQueueSuccess', {
      targetRef: normal_queue_ref,
      nextOrder,
    })
    expect(spotifyAPI.queue).toBeCalledWith(`spotify:track:track_id1`, expect.anything())
  })
  it('has urgent queue', () => {
    ;[1, 2].forEach(num => {
      const order = new Order({
        orderer_id: `orderer_id${num}`,
        orderer_name: `orderer_name${num}`,
        track_id: `track_id${num}`,
        track_name: `track_name${num}`,
      })
      mutations._addOrder(state, { storeTarget: 'urgent', order })
    })
    expect(getObjectLength(state.urgent_queue)).toBe(2)
    const result = getters._nextOrder(state)
    const nextOrderId = Object.values(state.urgent_queue)[0].id
    expect(result).toEqual({
      nextOrderId,
      targetQueue: 'urgent_queue',
    })
  })
})
