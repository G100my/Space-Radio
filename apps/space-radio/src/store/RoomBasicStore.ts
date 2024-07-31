import { defineStore } from 'pinia'
import { usePersonalStore } from '.'

const initState = {
  room_key: '',
  room_name: '',
  host_id: '',
  base_playlist: '',

  customerPlayerMode: false,
}

type State = typeof initState
export const useRoomBasicStore = defineStore('RoomBasicStore', {
  state: (): State => ({
    ...initState,
  }),
  getters: {
    isHostUser(state) {
      const personalStore = usePersonalStore()
      if (!state.host_id || !personalStore.id) return undefined
      else return state.host_id === personalStore.id
    },
  },
  actions: {
    update(newInfo: State) {
      Object.assign(this.$state, newInfo)
    },
    toggleCustomerPlayer(payload: boolean) {
      this.customerPlayerMode = payload
    },
  },
})
