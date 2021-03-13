const RoomBasic = {
  state: {
    room_key: '',
    room_name: '',
    host_id: '',
  },
  getters: {
    roomKey(state) {
      return state.room_key
    },
    roomName(state) {
      return state.room_name
    },
    hostId(state) {
      return state.host_id
    },
  },
  mutations: {
    setRoomBasicInfo(state, newInfo) {
      const { room_key, room_name, host_id } = newInfo
      state.room_key = room_key
      state.room_name = room_name
      state.host_id = host_id
    },
  },
}

export { RoomBasic }
