import type { SiteSettings } from 'server/schemas'
import type { AccessToken } from '@spotify/web-api-ts-sdk'
import { getAuth, getIdToken } from 'firebase/auth'

async function updateAuth(spotifyUserID: string, auth: AccessToken) {
  const url = new URL(import.meta.env.VITE_JUKEBOX_SERVER_URL + '/updateAuth')
  url.searchParams.set('space', spotifyUserID)
  fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await getIdToken(getAuth().currentUser!)}` },
    body: JSON.stringify(auth),
  })
}

async function resolveQueue(params: { space: string; key: string; action: 'approve' | 'reject' }) {
  const url = new URL(import.meta.env.VITE_JUKEBOX_SERVER_URL + '/resolveQueue')
  url.search = new URLSearchParams(params).toString()
  return fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await getIdToken(getAuth().currentUser!)}` },
  })
}

async function updateAllpass(space: string, settings: SiteSettings) {
  const url = new URL(import.meta.env.VITE_JUKEBOX_SERVER_URL + '/updateAllpass')
  url.search = new URLSearchParams({ space }).toString()
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(settings),
    headers: { Authorization: `Bearer ${await getIdToken(getAuth().currentUser!)}` },
  })
}

export const hostApi = {
  // getSpaceData,
  updateAuth,
  resolveQueue,
  updateAllpass,
}
