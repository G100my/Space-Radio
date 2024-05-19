import { usePersonalStore } from '@/store'

function dec2hex(dec: number) {
  const tmp = '0' + dec.toString(16)
  return tmp.substring(tmp.length - 2)
}
function generateCodeVerifier() {
  const array = new Uint32Array(56 / 2)
  window.crypto.getRandomValues(array)
  return Array.from(array, dec2hex).join('')
}

function sha256(plain: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  // returns promise ArrayBuffer
  return window.crypto.subtle.digest('SHA-256', data)
}
function base64urlencode(hashedString: number) {
  let str = ''
  const bytes = new Uint8Array(hashedString)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i])
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function generateCodeChallengeFromVerifier(codeVerifier: string) {
  const hashed = await sha256(codeVerifier)
  // ! fixme hashed type
  const base64encoded = base64urlencode(hashed as unknown as number)
  return base64encoded
}

// ===
const client_id = import.meta.env.VITE_CLIENT_ID
const redirect_uri = import.meta.env.VITE_REDIRECT_URI
const scope = `user-library-modify user-library-read playlist-modify-public playlist-modify-private user-read-recently-played user-top-read user-modify-playback-state user-read-currently-playing user-read-playback-state user-read-playback-position streaming user-read-email user-read-private`

async function PKCE(redirectHash: string) {
  const code_verifier = generateCodeVerifier()
  localStorage.setItem('spaceradio_code_verifier', code_verifier)

  const code_challenge = await generateCodeChallengeFromVerifier(code_verifier)
  let url = 'https://accounts.spotify.com/authorize'
  url += '?response_type=code'
  url += '&client_id=' + encodeURIComponent(client_id)
  url += '&redirect_uri=' + encodeURIComponent(redirect_uri + redirectHash)
  url += '&scope=' + encodeURIComponent(scope)
  url += '&code_challenge_method=S256'
  url += '&code_challenge=' + code_challenge

  window.location = url as Location & string
}

async function fetchAccessToken(code: string, redirectHash: string) {
  const code_verifier = localStorage.getItem('spaceradio_code_verifier')
  localStorage.removeItem('spaceradio_code_verifier')

  let body = 'client_id=' + client_id
  body += '&grant_type=authorization_code'
  body += '&code=' + code
  body += '&redirect_uri=' + redirect_uri + redirectHash
  body += '&code_verifier=' + code_verifier

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    body,
  })

  if (response.ok) return await response.json().then(storeToken)
  else console.error('something wrong in fetchAccessToken', response)
}

async function refreshAccessToken() {
  const personalStore = usePersonalStore()
  let body = 'client_id=' + client_id
  body += '&grant_type=refresh_token'
  body += '&refresh_token=' + personalStore.refresh_token

  return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    body,
  })
    .then(response => {
      if (response.ok) return response.json()
      else console.error('something wrong in refreshAccessToken', response)
    })
    .then(storeToken)
}

interface FetchTokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: 3600
  refresh_token: string
  scope: 'playlist-modify-private user-read-email user-read-private streaming user-modify-playback-state user-library-read user-library-modify playlist-modify-public user-read-playback-state user-read-currently-playing user-read-recently-played user-read-playback-position user-top-read'
}
function storeToken(result: FetchTokenResponse) {
  const personalStore = usePersonalStore()
  const { access_token, expires_in, refresh_token } = result
  const expiredTime = expires_in * 1000 + Date.now()
  personalStore.updateToken({ access_token, expiredTime, refresh_token })
}

export { PKCE, fetchAccessToken, refreshAccessToken }
