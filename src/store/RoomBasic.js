const RoomBasic = {
  state: {
    room_key: '',
    room_name: '',
    host_id: '',
    base_playlist: '',
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
    roomBasePlaylist(state) {
      return state.base_playlist
    },
  },
  mutations: {
    setRoomBasicInfo(state, newInfo) {
      const { room_key, room_name, host_id, base_playlist } = newInfo
      state.room_key = room_key
      state.room_name = room_name
      state.host_id = host_id
      state.base_playlist = base_playlist
    },
  },
}

export { RoomBasic }
