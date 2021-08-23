import { actions, mutations, state as initState, getters as initGetters, pending_queue_ref, getters } from './Queue'
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
    const key = '1111'

    mutations._addOrder(state, { storeTarget: 'normal', order, key })
    expect(Object.keys(state.normal_queue).length).toBe(1)
    expect(state.normal_queue[key]).toEqual(order)
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
      mutations._addOrder(state, { storeTarget: 'normal', order, key: num })
    })
    expect(getObjectLength(state.normal_queue)).toBe(3)
    expect(getObjectLength(state.urgent_queue)).toBe(0)
    pending_queue_ref.set = jest.fn()

    spotifyAPI.queue = jest.fn((uri, callback) => {
      callback()
    })

    const getters = deepCopy(initGetters)
    getters._nextOrder = initGetters._nextOrder(state)

    const dispatch = jest.fn(() => {})
    actions.sendNextQueue({ state, getters, dispatch })
    const { order, currentOrderId } = getters._nextOrder
    expect(dispatch).toBeCalledTimes(2)
    expect(dispatch).toHaveBeenNthCalledWith(1, 'normalRemove', '1')
    expect(dispatch).toHaveBeenNthCalledWith(2, '_addPendingQueue', {
      order,
      currentOrderId,
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
      mutations._addOrder(state, { storeTarget: 'urgent', order, key: num })
    })
    expect(getObjectLength(state.urgent_queue)).toBe(2)
    const result = getters._nextOrder(state)
    const [currentOrderId, order] = Object.entries(state.urgent_queue)[0]
    expect(result).toEqual({
      currentOrderId,
      order,
      targetQueue: 'urgent_queue',
    })
  })
})
