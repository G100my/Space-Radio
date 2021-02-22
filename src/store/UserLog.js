import firebase from './firebase.js'

const user_log_ref = firebase.database().ref('user_log')

const UserLog = {
  state: {
    log: [
      {
        actionType: '',
        userId: '',
        timestamp: 0,
        option: null,
        message: '',
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

function userLogFirebasePlugin(store) {
  const userId = store.getters.userId

  const afterHandlers = {
    add({ payload }) {
      const { id, trackName } = payload
      const message = `${userId} 點播了 ${trackName}`
      return { option: id, message }
    },
    jumpIn({ payload }) {
      const { id, trackName } = payload
      const message = `${userId} 插播了 ${trackName}`
      return { option: id, message }
    },
    normalRemove({ payload }) {
      const { id, trackName } = payload
      const message = `${userId} 從點播序列移除了 ${trackName}`
      return { option: id, message }
    },
    urgentRemove({ payload }) {
      const { id, trackName } = payload
      const message = `${userId} 從插播序列移除了 ${trackName}`
      return { option: id, message }
    },
    normal2urgent({ payload }) {
      const { id, trackName } = payload
      const message = `${userId} 把 ${trackName} 從點播序列移到插播序列`
      return { option: id, message }
    },
    urgent2normal({ payload }) {
      const { id, trackName } = payload
      const message = `${userId} 把 ${trackName} 從插播序列移到點播序列`
      return { option: id, message }
    },
    // ====
    turnUp(_action, state) {
      const volume = state.PlayingState.volume
      const message = `${userId} 調高音量: ${volume}`
      return { option: volume, message }
    },
    turnDown(_action, state) {
      const volume = state.PlayingState.volume
      const message = `${userId} 調低音量: ${volume}`
      return { option: volume, message }
    },
    reduceDislike(_action, state) {
      const id = state.PlayingState.info.track.id
      return { option: id, message: false }
    },
    increaseDislike(_action, state) {
      const id = state.PlayingState.info.track.id
      return { option: id, message: false }
    },
  }

  const maker = function ({ type }) {
    return {
      actionType: type,
      userId,
      timestamp: Date.now(),
    }
  }

  store.subscribeAction({
    after: (action, state) => {
      if (!Object.prototype.hasOwnProperty.call(afterHandlers, action.type)) return
      let log = { ...maker(action), ...afterHandlers[action.type](action, state) }
      user_log_ref.push(log)
    },
  })

  user_log_ref.limitToLast(3).on('child_added', snapshot => {
    store.commit('pushUserLog', snapshot.val())
  })
}

export { UserLog, userLogFirebasePlugin }
