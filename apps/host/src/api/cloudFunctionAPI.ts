import { getAuth, getIdToken } from 'firebase/auth'

async function resolveQueue(params: { space: string; key: string; action: 'approve' | 'reject' }) {
  const url = new URL(import.meta.env.VITE_JUKEBOX_SERVER_URL + '/resolveQueue')
  url.search = new URLSearchParams(params).toString()
  return fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await getIdToken(getAuth().currentUser!)}` },
  })
}

export const hostApi = {
  resolveQueue,
}
