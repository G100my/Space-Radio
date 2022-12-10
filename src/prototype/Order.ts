import type { Note } from '@/store'

export class Order {
  id: string
  orderer_id: string
  orderer_name: string
  track_id: string
  track_name: string
  note: false | Note = false

  constructor({
    id,
    note = false,
    ...rest
  }: {
    id?: string
    orderer_id: string
    orderer_name: string
    track_name: string
    track_id: string
    note: Note | false
  }) {
    this.orderer_id = rest.orderer_id
    this.orderer_name = rest.orderer_name
    this.track_id = rest.track_id
    this.track_name = rest.track_name
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
