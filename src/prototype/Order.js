export class Order {
  /**
   *
   * @param {Object} paramsObject id, orderer_id, orderer_name, track_name, key, note = false
   */
  constructor({ id, orderer_id, orderer_name, track_name, track_id, note = false }) {
    this.orderer_id = orderer_id
    this.orderer_name = orderer_name
    this.track_id = track_id
    this.track_name = track_name
    this.note = note
    if (!id) {
      this.id = `${Date.now().toString()}-${Math.floor(Math.random() * 10000).toString(16)}`
    } else {
      this.id = id
    }

    // just for Dev test
    if (import.meta.env.DEV) {
      Object.values(this).forEach(i => {
        // note can be false
        if (i === undefined || i === null || i === '') {
          console.log(this)
          throw new Error('Order object miss neccessary property')
        }
      })
    }
  }
}
