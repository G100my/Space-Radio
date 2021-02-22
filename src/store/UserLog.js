import firebase from './firebase.js'

const user_log_ref = firebase.database().ref('user_log')

const UserLog = {
  state: {
    log: [
      {
        actionType: '',
        user: '',
        timestamp: 0,
      },
    ],
  },
}

function userLogFirebasePlugin(store) {
  store.subscribeAction({
    after: (action, state) => {
      console.log(action, state)
    },
  })
  user_log_ref.on('child_added', snapshot => {
    store.commit('addLog', snapshot.val())
  })
}

export { UserLog, userLogFirebasePlugin }
