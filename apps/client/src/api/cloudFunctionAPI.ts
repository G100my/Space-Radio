import type { AddedQueue } from 'server'
import type { PlaybackStateOnlyTrack } from 'shared'

function addQueue(
  query: {
    site: string
    space: string
  },
  body: AddedQueue
) {
  const url = new URL(import.meta.env.VITE_JUKEBOX_SERVER_URL + '/addQueue')
  url.search = new URLSearchParams(query).toString()

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

function getCurrentPlaying(
  space: string
): Promise<(PlaybackStateOnlyTrack & { spaceName: string }) | null | undefined> {
  const url = new URL(import.meta.env.VITE_JUKEBOX_SERVER_URL + '/getCurrentPlaying')
  url.search = new URLSearchParams({ space }).toString()

  return fetch(url).then(response => {
    console.info(response)
    if (response.ok) {
      if (response.status === 200) {
        console.info(response)
        return response.json()
      } else if (response.status === 204) {
        return Promise.resolve(undefined)
      } else {
        response.text().then(console.error)
        return null
      }
    } else return Promise.reject(response)
  })
}

export const clientApi = {
  addQueue,
  getCurrentPlaying,
}
