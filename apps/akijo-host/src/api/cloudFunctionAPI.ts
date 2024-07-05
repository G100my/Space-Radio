import type { SiteSettings } from 'functions/src/constants'
import type { AccessToken } from '@spotify/web-api-ts-sdk'

function updateAuth(spotifyUserID: string, auth: AccessToken) {
  const url = new URL(import.meta.env.VITE_AKIJO_SERVER_URL + '/updateAuth')
  url.searchParams.set('space', spotifyUserID)
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(auth),
  })
}

function resolveQueue(params: { space: string; key: string; action: 'approve' | 'reject' }) {
  const url = new URL(import.meta.env.VITE_AKIJO_SERVER_URL + '/resolveQueue')
  url.search = new URLSearchParams(params).toString()
  return fetch(url, {
    method: 'POST',
  })
}

function updateAllpass(space: string, settings: SiteSettings) {
  const url = new URL(import.meta.env.VITE_AKIJO_SERVER_URL + '/updateAllpass')
  url.search = new URLSearchParams({ space }).toString()
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(settings),
  })
}

export const hostApi = {
  // getSpaceData,
  updateAuth,
  resolveQueue,
  updateAllpass,
}
