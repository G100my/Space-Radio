const data = [
  // 放  player state, 包含換歌的紀錄
]

export default data
let table = data.map(({ paused, duration, position, track_window }) => {
  const tmp = {
    paused,
    duration,
    position,
    setTimeout: position !== 0 && duration - position > 10000 && !paused,
    trackId: track_window.current_track.id,
  }
  return tmp
})
console.table(table)
