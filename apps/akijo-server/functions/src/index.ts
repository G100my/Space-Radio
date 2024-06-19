import * as logger from 'firebase-functions/logger'
import { https, type Response, type Request } from 'firebase-functions'

import { Site, addQueueSchema } from './constants'
import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import admin = require('firebase-admin')

admin.initializeApp({
  databaseURL: 'https://akijo-space.asia-southeast1.firebasedatabase.app/',
})

// firebase realtime database
const db = admin.database()

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const allowedOrigins = ['https://akijo.space', 'localhost:2405']
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
    logger.error('Invalid request body', { error })
    response.status(400).send('Bad Request')
    return
  }
}

const scope = ['user-modify-playback-state', 'user-read-currently-playing']
function createSpotifyInstance() {
  return SpotifyApi.withClientCredentials(process.env.SPOTIFY_CLIENT_ID!, process.env.SPOTIFY_CLIENT_SECRET!, scope)
}

export const addQueue = https.onRequest((request, response) => {
  checkOrigin(request, response)
  handleOptions(request, response)

  const site = request.query.site
  const place = request.query.place
  if (!place || typeof place !== 'string') {
    logger.error('Invalid query', { place })
    response.status(400).send('Bad Request')
    return
  }

  const ref = db.ref(place)
  ref.once('value', snapshot => {
    if (!snapshot.exists()) {
      logger.error('Place not found', { site, place })
      response.status(404).send('Not Found')
    }
  })

  const queue = checkRequestBody(request, response)!

  ref.child('sites').once('value', snapshot => {
    const siteData = snapshot.val() as Site | null
    if (!siteData) {
      logger.error('Site not found', { site, place })
      response.status(404).send('Not Found')
    } else if (!siteData.need_review) {
      const spotifySDK = createSpotifyInstance()
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
