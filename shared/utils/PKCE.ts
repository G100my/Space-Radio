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
// const client_id = import.meta.env.VITE_CLIENT_ID
// const redirect_uri = import.meta.env.VITE_BASE_URI
export const SPOTIFY_SCOPE = `user-library-modify user-library-read playlist-modify-public playlist-modify-private user-read-recently-played user-top-read user-modify-playback-state user-read-currently-playing user-read-playback-state user-read-playback-position streaming user-read-email user-read-private`

export interface AuthParams {
  client_id: string
  redirect_uri: string
}
async function PKCE(params: AuthParams) {
  const code_verifier = generateCodeVerifier()
  localStorage.setItem('spaceradio_code_verifier', code_verifier)

  const code_challenge = await generateCodeChallengeFromVerifier(code_verifier)
  let url = 'https://accounts.spotify.com/zh-TW/authorize'
  url += '?response_type=code'
  url += '&client_id=' + encodeURIComponent(params.client_id)
  url += '&redirect_uri=' + encodeURIComponent(params.redirect_uri)
  url += '&scope=' + encodeURIComponent(SPOTIFY_SCOPE)
  url += '&code_challenge_method=S256'
  url += '&code_challenge=' + code_challenge

  window.location = url as Location & string
}

export interface FetchTokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: 3600
  refresh_token: string
  timestamp: number
  scope: string // 'playlist-modify-private user-read-email user-read-private streaming user-modify-playback-state user-library-read user-library-modify playlist-modify-public user-read-playback-state user-read-currently-playing user-read-recently-played user-read-playback-position user-top-read'
}

async function fetchAccessToken(authorizationCode: string, params: AuthParams) {
  const code_verifier = localStorage.getItem('spaceradio_code_verifier')
  localStorage.removeItem('spaceradio_code_verifier')

  let body = 'client_id=' + params.client_id
  body += '&grant_type=authorization_code'
  body += '&code=' + authorizationCode
  body += '&redirect_uri=' + params.redirect_uri
  body += '&code_verifier=' + code_verifier

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    body,
  })

  if (response.ok) return (await response.json()) as Promise<FetchTokenResponse>
  else return Promise.reject(response)
}

async function refreshAccessToken(params: { refresh_token: string } & Pick<AuthParams, 'client_id'>) {
  let body = 'client_id=' + params.client_id
  body += '&grant_type=refresh_token'
  body += '&refresh_token=' + params.refresh_token

  return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    body,
  }).then(response => {
    if (response.ok) return response.json() as Promise<FetchTokenResponse>
    else {
      console.error('something wrong in refreshAccessToken')
      console.error(response)
      return Promise.reject(response)
    }
  })
}

export { PKCE, fetchAccessToken, refreshAccessToken }
