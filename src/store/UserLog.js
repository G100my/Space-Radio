import firebase from './firebase.js'

const user_log_ref = firebase.database().ref('user_log')

const UserLog = {
  state: {
    log: [
      {
        actionType: '',
        userId: '',
        timestamp: 0,
        option: {
          id: '',
          trackName: '',
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

function userLogFirebasePlugin(store) {
  const userId = store.getters.userId

  const maker = function ({ type }) {
    return {
      actionType: type,
      userId,
      timestamp: Date.now(),
    }
  }

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
            payload: { id, trackName },
          } = action
          userLog = { ...maker(action), option: { id, trackName } }
          break
        }

        case 'turnUp':
        case 'turnDown':
          userLog = { ...maker(action), option: { volume: state.PlayingState.volume } }
          break

        case 'reduceDislike':
        case 'increaseDislike':
          userLog = { ...maker(action), option: { id: state.PlayingState.info.track.id } }
          break

        default:
          return
      }
      user_log_ref.push(userLog)
    },
  })

  user_log_ref.limitToLast(3).on('child_added', snapshot => {
    store.commit('pushUserLog', snapshot.val())
  })
}

export { UserLog, userLogFirebasePlugin }
