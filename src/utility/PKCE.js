import store from '../store'

function dec2hex(dec) {
  return ('0' + dec.toString(16)).substr(-2)
}
function generateCodeVerifier() {
  let array = new Uint32Array(56 / 2)
  window.crypto.getRandomValues(array)
  return Array.from(array, dec2hex).join('')
}

function sha256(plain) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  // returns promise ArrayBuffer
  return window.crypto.subtle.digest('SHA-256', data)
}
function base64urlencode(hashedString) {
  let str = ''
  let bytes = new Uint8Array(hashedString)
  let len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i])
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function generateCodeChallengeFromVerifier(codeVerifier) {
  let hashed = await sha256(codeVerifier)
  let base64encoded = base64urlencode(hashed)
  return base64encoded
}

// ===
const client_id = import.meta.env.VITE_CLIENT_ID
const redirect_uri = import.meta.env.VITE_REDIRECT_URI
const scope = `user-library-modify user-library-read playlist-modify-public playlist-modify-private user-read-recently-played user-top-read user-modify-playback-state user-read-currently-playing user-read-playback-state user-read-playback-position streaming user-read-email user-read-private`

async function PKCE(redirectHash) {
  const code_verifier = generateCodeVerifier()
  localStorage.setItem('jukebox_code_verifier', code_verifier)

  const code_challenge = await generateCodeChallengeFromVerifier(code_verifier)
  let url = 'https://accounts.spotify.com/authorize'
  url += '?response_type=code'
  url += '&client_id=' + encodeURIComponent(client_id)
  url += '&redirect_uri=' + encodeURIComponent(redirect_uri + redirectHash)
  url += '&scope=' + encodeURIComponent(scope)
  url += '&code_challenge_method=S256'
  url += '&code_challenge=' + code_challenge

  window.location = url
}

async function fetchAccessToken(code, redirectHash) {
  const code_verifier = localStorage.getItem('jukebox_code_verifier')

  let body = 'client_id=' + client_id
  body += '&grant_type=authorization_code'
  body += '&code=' + code
  body += '&redirect_uri=' + redirect_uri + redirectHash
  body += '&code_verifier=' + code_verifier

  return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    body,
  })
    .then(response => {
      if (response.ok) return response.json()
      else console.error('something wrong in fetchAccessToken', response)
    })
    .then(result => {
      const { access_token, expires_in, refresh_token } = result
      const expiredTime = expires_in * 1000 + Date.now()
      store.commit('refreshToken', { access_token, expiredTime, refresh_token })
    })
}

async function refreshAccessToken() {
  let body = 'client_id=' + client_id
  body += '&grant_type=refresh_token'
  body += '&refresh_token=' + store.getters.refreshToken

  return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    body,
  })
    .then(response => {
      if (response.ok) return response.json()
      else console.error('something wrong in refreshAccessToken', response)
    })
    .then(result => {
      const { access_token, expires_in, refresh_token } = result
      const expiredTime = expires_in * 1000 + Date.now()
      store.commit('refreshToken', { access_token, expiredTime, refresh_token })
    })
}
window.refreshAccessToken = refreshAccessToken

export { PKCE, fetchAccessToken, refreshAccessToken }
