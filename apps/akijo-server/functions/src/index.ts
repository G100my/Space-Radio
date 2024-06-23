import { https, type Response, type Request, logger } from 'firebase-functions'
import { AddQueueSchema, Site, SpaceClientData, addQueueSchema } from './constants'
import admin = require('firebase-admin')
import { checkQueryIsString, createSpotifyInstance, handleOptions } from './utils'
import { AccessToken } from '@spotify/web-api-ts-sdk'

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
    } else {
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
          ref
            .child('auth')
            .once('value')
            .then(snapshot => {
              const accessToken = snapshot.val() as AccessToken
              const spotifySDK = createSpotifyInstance(accessToken)
              logger.log(spotifySDK.users.profile)

              spotifySDK.player
                .addItemToPlaybackQueue(queue.uri)
                .then(() => {
                  response.status(200).send('OK')
                })
                .catch(error => {
                  logger.error('Failed to add queue to current user', { error })
                  response.status(500).send('Failed to add queue to current user')
                })
            })
        } else if (siteData.need_review) {
          ref.child('queue').push(queue)
        }
      })
    }
  })
})

export const getCurrentPlaying = https.onRequest((request, response) => {
  checkOrigin(request, response)
  handleOptions(request, response)

  if (!checkQueryIsString(response, request.query.space)) return

  db.ref(request.query.space + '/auth').once('value', snapshot => {
    const spotifySDK = createSpotifyInstance(snapshot.val() as AccessToken)
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
})

export const hostUpdateAuth = https.onRequest((request, response) => {
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
      db.ref(space + '/auth').update(request.body as AccessToken)
    }
  })
})

export const getSpaceData = https.onRequest((request, response) => {
  checkOrigin(request, response)
  handleOptions(request, response)

  logger.log('Get space data', request.query)

  const space = request.query.space
  if (!checkQueryIsString(response, space)) return

  db.ref(space + '/data').once('value', snapshot => {
    if (!snapshot.exists()) {
      logger.warn('space not found', { space })
      response.status(404).send('Not Found')
    } else {
      response.status(200).send(snapshot.val() as SpaceClientData)
    }
  })
})

export const updateSite = https.onRequest((request, response) => {
  checkOrigin(request, response)
  handleOptions(request, response)

  const space = request.query.space
  if (!checkQueryIsString(response, space)) return

  const ref = db.ref(space)
  ref.once('value', snapshot => {
    if (!snapshot.exists()) {
      logger.warn('space not found', { space })
      response.status(404).send('Not Found')
    } else {
      const siteData = request.body
      ref.child('sites').update(siteData)
    }
  })
})
