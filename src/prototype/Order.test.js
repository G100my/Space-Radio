import { Order } from './Order.js'

describe.only('order calss', () => {
  const neccessaryParams = {
    track_id: 'fake track id',
    track_name: 'fake track name',
    orderer_id: 'g100',
    orderer_name: 'g100my',
  }
  const note = {}
  Date.now = jest.fn(() => '1628955172330')
  Math.random = jest.fn(() => '0.5')

  it('new Order without id', () => {
    const order = new Order({ ...neccessaryParams, note })
    const expectResult = { ...neccessaryParams, note, id: `${Date.now()}-1388` }
    expect(order).toEqual(expectResult)
  })
  it('new Order with id', () => {
    const id = 'fake order id'
    const order = new Order({ ...neccessaryParams, note, id })
    const expectResult = { ...neccessaryParams, note, id }
    expect(order).toEqual(expectResult)
  })
  it('params is empty string', () => {
    const params = { ...neccessaryParams, orderer_id: '' }
    expect(() => new Order(params)).toThrowError()
  })
  it('miss params', () => {
    delete neccessaryParams.track_name
    expect(() => new Order(neccessaryParams)).toThrowError()
  })
})
