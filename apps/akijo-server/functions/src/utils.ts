import { type Response, type Request, logger } from 'firebase-functions'
import { SPOTIFY_SERVER_SCOPE } from './constants'
import { SpotifyApi } from '@spotify/web-api-ts-sdk'

export function handleOptions(request: Request, response: Response) {
  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'POST')
    response.set('Access-Control-Allow-Headers', 'Content-Type')
    response.set('Access-Control-Max-Age', '3600')
    response.status(204).send('')
  }
}
export function createSpotifyInstance() {
  logger.log(
    'Create Spotify instance',
    process.env.SPOTIFY_CLIENT_ID!,
    process.env.SPOTIFY_CLIENT_SECRET!,
    SPOTIFY_SERVER_SCOPE
  )
  return SpotifyApi.withClientCredentials(
    'cc205d361653438eab0d6b967dcf4a8f',
    'e44a5314fca343b2b8b16293583ae3fd',
    SPOTIFY_SERVER_SCOPE
  )
}
export function checkQueryIsString(response: Response, query: Request['query'][string]): query is string {
  if (!query || typeof query !== 'string') {
    logger.warn('Invalid query', { query })
    response.status(400).send('Bad Request')
    return false
  }
  return true
}
