import { type Response, type Request, logger } from 'firebase-functions'
import { AccessToken, SpotifyApi } from '@spotify/web-api-ts-sdk'
import type { AuthParams } from 'shared/types'
import type { Database } from 'firebase-admin/database'
import { AddedQueue } from './schemas'
import type { Auth } from 'firebase-admin/auth'

export interface CustomAuth extends AccessToken {
  timestamp: number
}
export function isTokenExpired(auth: CustomAuth) {
  const now = Date.now()
  const buffer = 60 * 5 * 1000 // 5 minutes
  const expired = auth.timestamp + auth.expires_in * 1000 - buffer
  return now > expired
}

function refreshAccessToken(params: { refresh_token: string } & Pick<AuthParams, 'client_id'>) {
  let body = 'client_id=' + params.client_id
  body += '&grant_type=refresh_token'
  body += '&refresh_token=' + params.refresh_token

  return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    body,
  })
}
export function createSpotifyInstance({
  tokens,
  updateTokenCallback,
  response,
}: {
  tokens: CustomAuth
  updateTokenCallback: (auth: AccessToken) => void
  response: Response
}) {
  if (isTokenExpired(tokens)) {
    return refreshAccessToken({
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      refresh_token: tokens.refresh_token,
    })
      .then(refreshTokenRes => {
        if (refreshTokenRes.ok) return refreshTokenRes.json() as Promise<AccessToken>
        else {
          logger.log('Failed to refresh token response status:', refreshTokenRes.status)
          const status = refreshTokenRes.status
          return refreshTokenRes.json().then(data => {
            response.status(status).send(data)
            return Promise.reject(data)
          })
        }
      })
      .then(res => {
        logger.log('Refreshed token', tokens)
        updateTokenCallback(res)
        return SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID!, res)
      })
  } else {
    return Promise.resolve(SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID!, tokens))
  }
}
export function checkQueryIsString(response: Response, query: Request['query'][string]): query is string {
  if (!query || typeof query !== 'string') {
    logger.warn('Invalid query', { query })
    response.status(400).send('Bad Request')
    return false
  }
  return true
}

export function updateAuthCallback(hostUid: string, auth: AccessToken, db: Database) {
  const timestamp = new Date().getTime()
  db.ref(hostUid + '/auth').update({ ...auth, timestamp })
}

export async function sendQueue(spotifySDK: SpotifyApi, queue: AddedQueue, response: Response) {
  return spotifySDK.player
    .addItemToPlaybackQueue(queue.uri)
    .catch((error: any) => {
      if (error.name === 'SyntaxError') return Promise.resolve()
      else return Promise.reject(error)
    })
    .then(() => {
      response.status(200).send('OK')
    })
    .catch((error: any) => {
      if ((error.message as string).includes('NO_ACTIVE_DEVICE')) {
        response.status(409).send('No active device')
        return
      }
      response.status(500).send('Failed to add queue to current host')
      console.log('Failed to add queue to current host', { error })
    })
}

export async function checkAuth(request: Request, response: Response, auth: Auth, email: string) {
  const token = request.headers.authorization?.split('Bearer ')[1]
  if (!token) {
    logger.warn('No Authorization header')
    response.status(401).send('Unauthorized')
    return null
  } else {
    return auth
      .verifyIdToken(token)
      .then(DecodedIdToken => {
        if (DecodedIdToken.email === email) {
          return DecodedIdToken
        } else {
          logger.warn('Invalid token email', { email: DecodedIdToken.email })
          response.status(401).send('Unauthorized')
          return null
        }
      })
      .catch(error => {
        if (
          error.code === 'auth/argument-error' &&
          (error.message as string).startsWith('Firebase ID token has invalid signature.')
        ) {
          logger.warn('Invalid token signature')
          response.status(401).send('Unauthorized')
        } else {
          logger.error('Failed to verify token', { error })
          response.status(500).send('Internal Server Error')
        }
        return null
      })
  }
}
