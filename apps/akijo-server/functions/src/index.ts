import { https, type Response, type Request, logger } from 'firebase-functions'
import { AddQueueSchema, Site, addQueueSchema } from './constants'
import admin = require('firebase-admin')
import { checkQueryIsString, createSpotifyInstance, handleOptions } from './utils'

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

  let queue: AddQueueSchema
  try {
    queue = addQueueSchema.parse(request.body)
  } catch (error) {
    logger.warn('Invalid request body', { error })
    response.status(400).send('Bad Request')
    return
  }

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
