import { defineStore } from 'pinia'

const initState = {
  room_key: '',
  room_name: '',
  host_id: '',
  base_playlist: '',
}

type State = typeof initState
export const useRoomBasicStore = defineStore('RoomBasicStore', {
  state: (): State => ({
    ...initState,
  }),
  actions: {
    update(newInfo: State) {
      Object.assign(this.$state, newInfo)
    },
  },
})
