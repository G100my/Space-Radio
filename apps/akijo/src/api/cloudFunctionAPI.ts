import type { AddQueueSchema, SpaceClientData } from 'functions/src/constants'

function addQueue(
  query: {
    site: string
    place: string
  },
  body: AddQueueSchema
) {
  const url = new URL(import.meta.env.VITE_AKIJO_SERVER_URL + '/addQueue')
  url.search = new URLSearchParams(query).toString()

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

function getSpaceData(spotifyUserID: string) {
  const url = new URL(import.meta.env.VITE_AKIJO_SERVER_URL + '/getSpaceData')
  url.search = new URLSearchParams({ space: spotifyUserID }).toString()
  console.log('🚀 ~ getSpaceData ~ url.search:', url.search)

  return fetch(url, {
    method: 'GET',
  }).then(async res => (await res.json()) as SpaceClientData)
}

export default { addQueue, getSpaceData }
