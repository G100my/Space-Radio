import store from '@/store'

// 送出去的點歌可能會因為 spotify 回應不一樣的id...orz，但是歌的內容一樣= =+
function clearPendingQueueHandler({ position, track_window }, pending) {
  // const pending = store.getters.pendingOrder
  if (position === 0) return
  if (!pending) return

  const { current_track } = track_window
  if (pending.track_id === current_track.id || pending.track_id === current_track.linked_from.id) {
    // 如果已經有 pending queue 而且跟現在正在撥放的是同一首歌，清空 pending
    store.dispatch('clearPendingQueue')
  }
}

// ===

function diffirentPlayingTrackIdHandler(playerState, playerPlayingTrackId) {
  // 更新 playingState, 如果 playingState 的 track id 和 player 回傳的 id 不一樣
  if (playerState.track_window.current_track.id !== playerPlayingTrackId)
    store.dispatch('updatePlayingTrack', playerState.track_window.current_track)
  store.dispatch('clearDislikeVote')
}

// ===

// 獲得狀態 刷新計時
// bufferTime < 10 不再更新計時
// 有沒有歌不再範圍內
// 快轉不考慮
let coundDownTimer
const EXECUTE_BEFORE_END_TIME = 10000
function setNextQueueTimeoutHandler({ duration, position, paused }) {
  if (position == 0) return
  if (paused && coundDownTimer) clearTimeout(coundDownTimer)
  const bufferTime = duration - position - EXECUTE_BEFORE_END_TIME
  if (!paused && bufferTime > 0) {
    if (coundDownTimer) clearTimeout(coundDownTimer)
    coundDownTimer = setTimeout(() => {
      store.dispatch('sendNextQueue')
    }, bufferTime)
  }
}

// ===

let lastTimestamp = 0
function updateProgressTimeHandler(playerState) {
  const { paused, duration, position, timestamp } = playerState
  if (timestamp - lastTimestamp < 1500) {
    lastTimestamp = timestamp
  } else if (position !== 0 && !paused) {
    store.dispatch('updateProgress', { paused, duration, position })
  } else if (paused) {
    store.dispatch('updatePauseProgress')
  }
}

// ===

export {
  clearPendingQueueHandler,
  diffirentPlayingTrackIdHandler,
  setNextQueueTimeoutHandler,
  updateProgressTimeHandler,
}
