import firebase from '@/plugins/firebase'
import { defineStore } from 'pinia'
import { usePersonalStore } from './PersonalStore'
import { usePlayingStore, useVolumeStore, useVoteStore } from './PlayingStateStore'
import { useQueueStore } from './QueueStore'

const userLogMaker = function (type: string) {
  const personalStore = usePersonalStore()
  return {
    action_type: type,
    user_id: personalStore.user_id,
    user_name: personalStore.display_name,
    timestamp: Date.now(),
  }
}

type UserLog = {
  payload: string | number | string[]
} & ReturnType<typeof userLogMaker>

let user_log_ref: firebase.database.Reference

function setUserLogRef(roomKey: string) {
  user_log_ref = firebase.database().ref(`${roomKey}/user_log/`)
}

const logLimit = 50
const useUserLogStore = defineStore('UserLogStore', {
  state: () => ({
    logs: [] as UserLog[],
  }),
  actions: {
    pushUserLog(snapshot: UserLog) {
      const logLength = this.logs.unshift(snapshot)
      if (logLength > logLimit) this.logs.pop()
    },
  },
})

function userLogConnect2firebase() {
  let recordVolumeLogTimer: ReturnType<typeof setTimeout> | null = null

  const unsubscribeQueueStore = useQueueStore().$onAction(({ name, store, args, after, onError }) => {
    const startTime = Date.now()
    switch (name) {
      case 'normalRemove':
      case 'urgentRemove':
      case 'normal2urgent':
      case 'urgent2normal': {
        const orderKey = args[0]
        const text = store.trackData[orderKey].name
        const userLog = { ...userLogMaker(name), payload: text }
        user_log_ref.push(userLog)
        break
      }
    }

    after(() => {
      let userLog
      switch (name) {
        case 'add':
        case 'jumpIn': {
          const track_name = args[1]
          userLog = { ...userLogMaker(name), payload: track_name }
          break
        }

        case 'addMultiple': {
          const names = args[1]
          userLog = { ...userLogMaker(name), payload: names }
          break
        }
      }
      if (userLog) user_log_ref.push(userLog)
    })
    // this will trigger if the action throws or returns a promise that rejects
    onError(error => {
      console.warn(`Failed "${name}" after ${Date.now() - startTime}ms.\nError: ${error}.`)
    })
  })

  const unsubscribeVolumeStore = useVolumeStore().$onAction(({ name, store, args, after }) => {
    after(() => {
      switch (name) {
        case 'turnUp':
        case 'turnDown':
          if (recordVolumeLogTimer) clearTimeout(recordVolumeLogTimer)
          recordVolumeLogTimer = setTimeout(() => {
            const userLog = { ...userLogMaker(name), option: { volume: store.volume } }
            user_log_ref.push(userLog)
          }, 3000)
          break
        case 'updateMinimalVolume': {
          const userLog = { ...userLogMaker(name), payload: store.minimal_volume }
          user_log_ref.push(userLog)
          break
        }
      }
    })
  })

  const unsubscribeVoteStore = useVoteStore().$onAction(({ name, store, after }) => {
    after(() => {
      switch (name) {
        case 'reduceDislike':
        case 'increaseDislike': {
          const userLog = { ...userLogMaker(name), payload: usePlayingStore().playing_track.id }
          user_log_ref.push(userLog)
          break
        }
        case 'updateDislikeThreshold': {
          const userLog = { ...userLogMaker(name), payload: store.dislike_threshold }
          user_log_ref.push(userLog)
          break
        }
      }
    })
  })

  user_log_ref.limitToLast(logLimit).on('child_added', snapshot => {
    useUserLogStore().pushUserLog(snapshot.val())
  })

  return {
    unsubscribeQueueStore,
    unsubscribeVolumeStore,
    unsubscribeVoteStore,
  }
}

export { useUserLogStore, userLogConnect2firebase, setUserLogRef }
