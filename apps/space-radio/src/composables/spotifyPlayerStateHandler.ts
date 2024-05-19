import type { Order } from '@/store'
import { usePlayingStore, useProgressStore, useQueueStore, useVoteStore } from '@/store'

// 送出去的點歌可能會因為 spotify 回應不一樣的id...orz，但是歌的內容一樣= =+
function clearPendingQueueHandler({ position, track_window }: Spotify.PlaybackState, pending: Order | null) {
  if (position === 0) return
  if (!pending) return

  const { current_track } = track_window
  if (pending.track_id === current_track.id || pending.track_id === current_track.linked_from.id) {
    // 如果已經有 pending queue 而且跟現在正在撥放的是同一首歌，清空 pending
    useQueueStore().clearPendingQueue()
  }
}

// ===

function diffirentPlayingTrackIdHandler(
  playerState: Spotify.PlaybackState,
  playerPlayingTrackId: Spotify.PlaybackState['playback_id'] | null
) {
  // 更新 playingState, 如果 playingState 的 track id 和 player 回傳的 id 不一樣
  if (playerState.track_window.current_track.id !== playerPlayingTrackId) {
    usePlayingStore().updatePlayingTrack(playerState.track_window.current_track)
  }
  useVoteStore().clearDislikeVote()
}

// ===

// 獲得狀態 刷新計時
// bufferTime < 10 不再更新計時
// 有沒有歌不再範圍內
// 快轉不考慮
let coundDownTimer: ReturnType<typeof setTimeout>
const EXECUTE_BEFORE_END_TIME = 10000
function setNextQueueTimeoutHandler({ duration, position, paused }: Spotify.PlaybackState) {
  if (position == 0) return
  if (paused && coundDownTimer) clearTimeout(coundDownTimer)
  const bufferTime = duration - position - EXECUTE_BEFORE_END_TIME
  if (!paused && bufferTime > 0) {
    if (coundDownTimer) clearTimeout(coundDownTimer)
    coundDownTimer = setTimeout(() => {
      useQueueStore().sendNextQueue()
    }, bufferTime)
  }
}

// ===

let lastTimestamp = 0
function updateProgressTimeHandler(playerState: Spotify.PlaybackState) {
  const { paused, position, timestamp, duration } = playerState
  if (timestamp - lastTimestamp < 1500) {
    lastTimestamp = timestamp
  } else if (position !== 0 && !paused) {
    useProgressStore().updateProgress({ paused, position, duration })
  } else if (paused) {
    useProgressStore().updatePauseProgress()
  }
}

// ===

export {
  clearPendingQueueHandler,
  diffirentPlayingTrackIdHandler,
  setNextQueueTimeoutHandler,
  updateProgressTimeHandler,
}
