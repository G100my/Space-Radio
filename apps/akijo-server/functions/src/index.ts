import * as logger from 'firebase-functions/logger'
import { https, type Response, type Request } from 'firebase-functions'

import { SPOTIFY_SERVER_SCOPE, Site, addQueueSchema } from './constants'
import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import admin = require('firebase-admin')

admin.initializeApp({
  databaseURL: 'https://akijo-space.asia-southeast1.firebasedatabase.app/',
})

// firebase realtime database
const db = admin.database()

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const allowedOrigins = ['https://akijo.space', 'http://localhost:2405']
function checkOrigin(request: Request, response: Response) {
  const origin = request.get('Origin')!
  if (allowedOrigins.includes(origin)) {
    response.set('Access-Control-Allow-Origin', origin)
  } else {
    logger.warn('Forbidden origin', { origin })
    response.status(403).send('Forbidden')
  }
}
function handleOptions(request: Request, response: Response) {
  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'POST')
    response.set('Access-Control-Allow-Headers', 'Content-Type')
    response.set('Access-Control-Max-Age', '3600')
    response.status(204).send('')
  }
}
function checkRequestBody(request: Request, response: Response) {
  try {
    return addQueueSchema.parse(request.body)
  } catch (error) {
    logger.warn('Invalid request body', { error })
    response.status(400).send('Bad Request')
    return
  }
}
function createSpotifyInstance() {
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
function checkQueryIsString(response: Response, query: https.Request['query'][string]): query is string {
  if (!query || typeof query !== 'string') {
    logger.warn('Invalid query', { query })
    response.status(400).send('Bad Request')
    return false
  }
  return true
}

export const addQueue = https.onRequest((request, response) => {
  checkOrigin(request, response)
  handleOptions(request, response)

  const site = request.query.site
  const space = request.query.space
  if (!checkQueryIsString(response, space)) return

  const ref = db.ref(space)
  ref.once('value', snapshot => {
    if (!snapshot.exists()) {
      logger.warn('space not found', { site, space })
      response.status(404).send('Not Found')
    }
  })

  const queue = checkRequestBody(request, response)!

  ref.child('sites').once('value', snapshot => {
    const siteData = snapshot.val() as Site | null
    logger.info('Site data', siteData)
    if (!siteData) {
      logger.warn('Site not found', { site, space })
      response.status(404).send('Not Found')
    } else if (!siteData.need_review) {
      const spotifySDK = createSpotifyInstance()
      logger.log(spotifySDK.users.profile)

      // ! fixme
      spotifySDK.player
        .addItemToPlaybackQueue(queue.uri)
        .then(() => {
          response.status(200).send('OK')
        })
        .catch(error => {
          logger.error('Failed to add queue to current user', { error })
          response.status(500).send('Failed to add queue to current user')
        })
    } else if (siteData.need_review) {
      ref.child('queue').push(queue)
    }
  })
})

export const getCurrentPlaying = https.onRequest((request, response) => {
  checkOrigin(request, response)
  handleOptions(request, response)

  // ! fixme
  const spotifySDK = createSpotifyInstance()
  spotifySDK.player
    .getCurrentlyPlayingTrack()
    .then(currentPlaying => {
      response.status(200).send(currentPlaying)
    })
    .catch((error: any) => {
      logger.error('Failed to get current playing track', { error })
      response.status(500).send('Failed to get current playing track')
    })
})

export const hostLogin = https.onRequest((request, response) => {
  checkOrigin(request, response)
  handleOptions(request, response)

  logger.log('Host login', request.body)

  const space = request.query.space
  if (!checkQueryIsString(response, space)) return

  db.ref(space).once('value', snapshot => {
    if (!snapshot.exists()) {
      logger.warn('space not found', { space })
      response.status(404).send('Space Not Found')
    } else {
    }
  })
})

export const getSpaceData = https.onRequest((request, response) => {
  checkOrigin(request, response)
  handleOptions(request, response)

  logger.log('Get space data', request.query)

  const space = request.query.space
  if (!checkQueryIsString(response, space)) return

  db.ref(space).once('value', snapshot => {
    if (!snapshot.exists()) {
      logger.warn('space not found', { space })
      response.status(404).send('Not Found')
    } else {
      response.status(200).send(snapshot.val())
    }
  })
})
