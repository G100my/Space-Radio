import { type Response, type Request, logger } from 'firebase-functions'
import { SPOTIFY_SERVER_SCOPE } from './constants'
import { AccessToken, SpotifyApi } from '@spotify/web-api-ts-sdk'

export function isOptions(request: Request, response: Response) {
  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'POST')
    response.set('Access-Control-Allow-Headers', 'Content-Type')
    response.set('Access-Control-Max-Age', '3600')
    response.status(204).send('')
    return true
  } else return false
}
export function createSpotifyInstance(accessToken: AccessToken) {
  logger.log(
    'Create Spotify instance',
    process.env.SPOTIFY_CLIENT_ID!,
    process.env.SPOTIFY_CLIENT_SECRET!,
    SPOTIFY_SERVER_SCOPE
  )
  return SpotifyApi.withAccessToken(process.env.SPOTIFY_CLIENT_ID!, accessToken)
}
export function checkQueryIsString(response: Response, query: Request['query'][string]): query is string {
  if (!query || typeof query !== 'string') {
    logger.warn('Invalid query', { query })
    response.status(400).send('Bad Request')
    return false
  }
  return true
}

const allowedOrigins = ['https://akijo.space', 'http://localhost:2405']
export function isAllowedOrigin(request: Request, response: Response) {
  const origin = request.get('Origin')!
  if (allowedOrigins.includes(origin)) {
    response.set('Access-Control-Allow-Origin', origin)
    return true
  } else {
    logger.warn('Forbidden origin', { origin })
    response.status(403).send('Forbidden')
    return false
  }
}
