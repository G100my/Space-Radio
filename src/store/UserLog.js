import firebase from './firebase.js'

let user_log_ref

function setUserLogRef(roomKey) {
  user_log_ref = firebase.database().ref(`user_log/${roomKey}`)
}

const logLimit = 50
const UserLog = {
  state: {
    log: [],
  },
  getters: {
    userLog(state) {
      return state.log
    },
  },
  mutations: {
    pushUserLog(state, snapshot) {
      const logLength = state.log.unshift(snapshot)
      if (logLength > logLimit) state.log.pop()
    },
  },
}

function userLogConnect2firebase(store) {
  const maker = function (type) {
    return {
      action_type: type,
      user_id: store.getters.userId,
      user_name: store.getters.userName,
      timestamp: Date.now(),
    }
  }

  let recordVolumeLogTimer = null

  store.subscribeAction({
    before: (action, state) => {
      let userLog
      switch (action.type) {
        case 'normalRemove':
        case 'urgentRemove':
        case 'normal2urgent':
        case 'urgent2normal': {
          const orderKey = action.payload
          const track_name = state.Queue.trackData[orderKey].name
          userLog = { ...maker(action.type), option: { track_name } }
          break
        }

        default:
          break
      }
      user_log_ref.push(userLog)
    },
    after: (action, state) => {
      let userLog

      switch (action.type) {
        case 'add':
        case 'jumpIn':
        case 'addMultiple': {
          const { track_name } = action.payload
          userLog = { ...maker(action.type), option: { name: track_name } }
          break
        }

        case 'turnUp':
        case 'turnDown':
          if (recordVolumeLogTimer) clearTimeout(recordVolumeLogTimer)
          recordVolumeLogTimer = setTimeout(() => {
            userLog = { ...maker(action.type), option: { volume: state.PlayingState.volume } }
            user_log_ref.push(userLog)
          }, 3000)
          return

        case 'reduceDislike':
        case 'increaseDislike':
          userLog = { ...maker(action.type), option: { id: state.PlayingState.playing_track.id } }
          break
        case 'updateMinimalVolume':
          userLog = {
            ...maker(action.type),
            option: { minimal_volume: state.PlayingState.minimal_volume },
          }
          break
        case 'updateDislikeThreshold':
          userLog = {
            ...maker(action.type),
            option: {
              dislike_threshold: state.PlayingState.dislike_threshold,
            },
          }
          break
        default:
          return
      }
      user_log_ref.push(userLog)
    },
  })

  user_log_ref.limitToLast(logLimit).on('child_added', snapshot => {
    store.commit('pushUserLog', snapshot.val())
  })
}

export { UserLog, userLogConnect2firebase, setUserLogRef }
