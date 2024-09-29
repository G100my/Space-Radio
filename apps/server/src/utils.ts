import { type Response, type Request, logger } from 'firebase-functions'
import { AccessToken, SpotifyApi } from '@spotify/web-api-ts-sdk'
import type { AuthParams, CustomAuth, AddedQueue } from 'shared/types'
import type { Database } from 'firebase-admin/database'
import type { Auth } from 'firebase-admin/auth'
import EM from './ErrorMessage'

export function isTokenExpired(auth: CustomAuth) {
  const now = Date.now()
  const buffer = 60 * 5 * 1000 // 5 minutes
  const expired = auth.timestamp + auth.expires_in * 1000 - buffer
  if (isNaN(expired)) return true
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

function updateAuthCallback(hostUid: string, auth: AccessToken, db: Database) {
  const timestamp = new Date().getTime()
  db.ref(hostUid + '/auth').update({ ...auth, timestamp })
}
export function createSpotifyInstance({
  tokens,
  response,
  hostUid,
  db,
}: {
  tokens: CustomAuth
  response: Response
  hostUid: string
  db: Database
}) {
  if (isTokenExpired(tokens)) {
    return refreshAccessToken({
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      refresh_token: tokens.refresh_token,
    })
      .then(refreshTokenRes => {
        if (refreshTokenRes.ok) return refreshTokenRes.json() as Promise<AccessToken>
        else {
          logger.error('Failed to refresh token, response status:', refreshTokenRes.status)
          const status = refreshTokenRes.status
          return refreshTokenRes.json().then(data => {
            response.status(status).send(data)
            return Promise.reject(data)
          })
        }
      })
      .then(res => {
        logger.log('Record refreshed token:', tokens)
        updateAuthCallback(hostUid, res, db)
        return SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID!, res)
      })
  } else {
    return Promise.resolve(SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID!, tokens))
  }
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
        response.status(409).send(EM.SPOTIFY.NO_ACTIVE_DEVICE)
        return
      }
      response.status(500).send(EM.SPOTIFY.FAILED_TO_ADD_QUEUE)
      console.error(EM.SPOTIFY.FAILED_TO_ADD_QUEUE, error)
    })
}

export async function checkAuth(request: Request, response: Response, auth: Auth, email: string) {
  const token = request.headers.authorization?.split('Bearer ')[1]
  if (!token) {
    logger.warn(EM.AUTH.NO_AUTHORIZATION_HEADER)
    response.status(401).send(EM.AUTH.NO_AUTHORIZATION_HEADER)
    return null
  } else {
    return auth
      .verifyIdToken(token)
      .then(DecodedIdToken => {
        if (DecodedIdToken.email === email) {
          return DecodedIdToken
        } else {
          logger.log(EM.AUTH.INVALID_TOKEN_EMAIL, { email: DecodedIdToken.email })
          response.status(401).send(EM.AUTH.INVALID_TOKEN_EMAIL)
          return null
        }
      })
      .catch(error => {
        if (
          error.code === 'auth/argument-error' &&
          (error.message as string).startsWith('Firebase ID token has invalid signature.')
        ) {
          logger.log(EM.AUTH.INVALID_TOKEN_SIGNATURE)
          response.status(401).send(EM.AUTH.INVALID_TOKEN_SIGNATURE)
        } else {
          logger.error(EM.AUTH.FAILED_TO_VERIFY_TOKEN, { error })
          response.status(500).send(EM.GENERAL.INTERNAL_SERVER_ERROR)
        }
        return null
      })
  }
}
