import { https, type Response, logger } from 'firebase-functions'
import { addQueueSchema, SpaceClientData, AddedQueue } from './constants'
import admin = require('firebase-admin')
import { checkQueryIsString, createSpotifyInstance, isAllowedOrigin, isOptions } from './utils'
import { AccessToken } from '@spotify/web-api-ts-sdk'

admin.initializeApp({
  databaseURL: 'https://akijo-space.asia-southeast1.firebasedatabase.app/',
})

// firebase realtime database
const db = admin.database()

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

function sendQueue(accessToken: AccessToken, queue: AddedQueue, response: Response) {
  const spotifySDK = createSpotifyInstance(accessToken)
  logger.log(spotifySDK.users.profile)

  return spotifySDK.player
    .addItemToPlaybackQueue(queue.uri)
    .then(() => {
      response.status(200).send('OK')
    })
    .catch(error => {
      logger.error('Failed to add queue to current user', { error })
      response.status(500).send('Failed to add queue to current user')
    })
}

const addQueue = https.onRequest((request, response) => {
  if (!isAllowedOrigin(request, response)) return
  if (isOptions(request, response)) return

  const site = request.query.site
  const space = request.query.space
  if (!checkQueryIsString(response, space)) return

  const queueResult = addQueueSchema.safeParse(request.body)
  if (!queueResult.success) {
    logger.warn(request.body, queueResult.error)
    response.status(400).send('Bad Request')
    return
  }
  const queue = queueResult.data

  const spaceRef = db.ref(space)
  spaceRef
    .once('value', spaceSnapshot => {
      if (!spaceSnapshot.exists()) {
        logger.warn('space not found', { site, space })
        response.status(404).send('Not Found')
        return Promise.reject()
      } else {
        return spaceSnapshot
      }
    })
    .then(spaceSnapshot => {
      const allpass = spaceSnapshot.child('data/settings/all_pass').val()

      if (allpass) {
        const auth = spaceSnapshot.child('auth').val()
        sendQueue(auth, queue, response)
      } else {
        const needReview = spaceSnapshot.child(`data/sites/${site}/need_review`)
        if (!needReview.exists()) {
          logger.warn('Site not found', { site, space })
          response.status(404).send('Site Not Found')
        }

        if (needReview.val()) {
          spaceRef.child('data/queue').push(queue)
          response.status(200).send('OK')
        } else {
          const auth = spaceSnapshot.child('auth').val()
          sendQueue(auth, queue, response)
        }
      }
    })
})

const getCurrentPlaying = https.onRequest((request, response) => {
  if (!isAllowedOrigin(request, response)) return
  if (isOptions(request, response)) return

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

const hostUpdateAuth = https.onRequest((request, response) => {
  if (!isAllowedOrigin(request, response)) return
  if (isOptions(request, response)) return

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

const getSpaceData = https.onRequest((request, response) => {
  if (!isAllowedOrigin(request, response)) return
  if (isOptions(request, response)) return

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

const updateSite = https.onRequest((request, response) => {
  if (!isAllowedOrigin(request, response)) return
  if (isOptions(request, response)) return

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

export { addQueue, getCurrentPlaying, hostUpdateAuth, getSpaceData, updateSite }
