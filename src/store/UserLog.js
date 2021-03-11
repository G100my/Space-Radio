const UserLog = {
  state: {
    log: [
      {
        action_type: '',
        user_id: '',
        timestamp: 0,
        option: {
          id: '',
          track_name: '',
          volume: 0,
        },
      },
    ],
  },
  getters: {
    userLog(state) {
      return state.log
    },
  },
  mutations: {
    pushUserLog(state, snapshot) {
      const logLength = state.log.unshift(snapshot)
      if (logLength > 3) state.log.pop()
    },
  },
}

function userLogConnect2firebase(store) {
  const maker = function ({ type }) {
    return {
      action_type: type,
      user_id: store.getters.userId,
      user_name: store.getters.userName,
      timestamp: Date.now(),
    }
  }

  let recordVolumeLogTimer = null

  store.subscribeAction({
    after: (action, state) => {
      let userLog

      switch (action.type) {
        case 'add':
        case 'jumpIn':
        case 'normalRemove':
        case 'urgentRemove':
        case 'normal2urgent':
        case 'urgent2normal': {
          const {
            payload: { id, trackNameForLog: track_name },
          } = action
          userLog = { ...maker(action), option: { id, track_name } }
          break
        }

        case 'turnUp':
        case 'turnDown':
          if (recordVolumeLogTimer) clearTimeout(recordVolumeLogTimer)
          recordVolumeLogTimer = setTimeout(() => {
            userLog = { ...maker(action), option: { volume: state.PlayingState.volume } }
            store.getters.user_log_ref.push(userLog)
          }, 3000)
          return

        case 'reduceDislike':
        case 'increaseDislike':
          userLog = { ...maker(action), option: { id: state.PlayingState.playing_track.id } }
          break
        case 'updateMinimalVolume':
          userLog = {
            ...maker(action),
            option: { minimal_volume: state.PlayingState.minimal_volume },
          }
          break
        case 'updateDislikeThreshold':
          userLog = {
            ...maker(action),
            option: {
              dislike_threshold: state.PlayingState.dislike_threshold,
            },
          }
          break
        default:
          return
      }
      store.getters.user_log_ref.push(userLog)
    },
  })

  store.getters.user_log_ref.limitToLast(3).on('child_added', snapshot => {
    store.commit('pushUserLog', snapshot.val())
  })
}

export { UserLog, userLogConnect2firebase }
