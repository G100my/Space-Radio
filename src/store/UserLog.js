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
}

const verbMaker = storeTarget => (storeTarget === 'urgent' ? '插' : '點')

function userLogFirebasePlugin(store) {
  const userId = store.getters.userId

  const mutationHandlers = {
    addQueueTrack({ payload }) {
      const { storeTarget, addedTrack } = payload
      const verb = verbMaker(storeTarget)
      const { name: trackName, id: trackId } = addedTrack

      const message = `${userId} ${verb}播了 ${trackName}`
      return { option: trackId, message }
    },
    deleteQueueTrack({ payload }) {
      const { storeTarget } = payload
      const position = verbMaker(storeTarget)
      const { name: trackName, id: trackId } = store.getters.previousDeleted

      const message = `${userId} 從${position}播序列中移除 ${trackName}`
      return { option: trackId, message }
    },
  }

  const maker = function ({ type }) {
    return {
      actionType: type,
      userId,
      timestamp: Date.now(),
    }
  }
  store.subscribe(mutation => {
    if (!Object.prototype.hasOwnProperty.call(mutationHandlers, mutation.type)) return
    let log = { ...maker(mutation), ...mutationHandlers[mutation.type](mutation) }
    console.log(log.message)
  })
  user_log_ref.on('child_added', snapshot => {
    store.commit('addLog', snapshot.val())
  })
}

export { UserLog, userLogFirebasePlugin }
