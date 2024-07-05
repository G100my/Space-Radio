import { https, type Response, logger } from 'firebase-functions'
import { addQueueSchema, AddedQueue, settingsSchema } from './constants'
import admin = require('firebase-admin')
import { checkQueryIsString, createSpotifyInstance, isAllowedOrigin, isOptions, updateAuthCallback } from './utils'
import { AccessToken, SpotifyApi } from '@spotify/web-api-ts-sdk'

admin.initializeApp({
  databaseURL: 'https://akijo-space.asia-southeast1.firebasedatabase.app/',
})

// firebase realtime database
const db = admin.database()

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

async function sendQueue(spotifySDK: SpotifyApi, queue: AddedQueue, response: Response) {
  return spotifySDK.player
    .addItemToPlaybackQueue(queue.uri)
    .then(() => {
      response.status(200).send('OK')
    })
    .catch(error => {
      logger.error('Failed to add queue to current host', { error })
      response.status(500).send('Failed to add queue to current host')
    })
}

/**
 * Add queue to current host
 * @param site query
 * @param space query
 * @param queue body
 * @returns status 200 if success, status 400 if bad request, status 404 if site or space not found, status 500 if failed to add queue to current user
 */
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
          spaceRef.child('data/queue').push({ ...queue, site })
          response.status(200).send('OK')
        } else {
          const auth = spaceSnapshot.child('auth').val()
          sendQueue(auth, queue, response)
        }
      }
    })
})

/**
 * Get current playing track
 * @param space query
 * @returns current playing track, status 500 if failed to get current playing track
 */
const getCurrentPlaying = https.onRequest((request, response) => {
  if (!isAllowedOrigin(request, response)) return
  if (isOptions(request, response)) return

  if (!checkQueryIsString(response, request.query.space)) return

  const space = request.query.space

  db.ref(space + '/auth').once('value', snapshot => {
    if (!snapshot.exists()) {
      logger.warn('space not found', { space })
      response.status(404).send('Not Found')
      return
    }

    const auth = snapshot.val()

    createSpotifyInstance({
      tokens: auth,
      updateTokenCallback: newAuth => updateAuthCallback(space, newAuth, db),
      response,
    })
      .then(spotifySDK => spotifySDK.player.getCurrentlyPlayingTrack())
      .then(currentPlaying => {
        console.log('🚀 ~ db.ref ~ currentPlaying:', currentPlaying)
        if (currentPlaying) {
          db.ref(space + '/data/settings/name').once('value', snapshot => {
            response.status(200).send({ currentPlaying, spaceName: snapshot.val() })
          })
        } else {
          response.status(204).send()
        }
      })
      .catch(error => logger.error('Failed to get current playing track', { error }))
  })
})

/**
 * Update host auth
 * @param space query
 * @param body auth
 * @returns status 200 if success, status 404 if space not found
 */
const updateAuth = https.onRequest((request, response) => {
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
      const timestamp = new Date().getTime()
      db.ref(space + '/auth').update({ ...(request.body as AccessToken), timestamp })
      response.status(200).send('OK')
    }
  })
})

// const getSpaceData = https.onRequest((request, response) => {
//   if (!isAllowedOrigin(request, response)) return
//   if (isOptions(request, response)) return

//   logger.log('Get space data', request.query)

//   const space = request.query.space
//   if (!checkQueryIsString(response, space)) return

//   db.ref(space + '/data').once('value', snapshot => {
//     if (!snapshot.exists()) {
//       logger.warn('space not found', { space })
//       response.status(404).send('Not Found')
//     } else {
//       response.status(200).send(snapshot.val() as SpaceClientData)
//     }
//   })
// })

/**
 * Update site
 * @param space query
 * @param body site data
 * @returns status 404 if space not found
 */
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
      ref.child('data/sites').update(siteData)
    }
  })
})

/**
 * Update allpass
 * @param space query
 * @param body settings
 * @returns status 200 if success, status 400 if bad request, status 404 if space not found
 */
const updateAllpass = https.onRequest((request, response) => {
  if (!isAllowedOrigin(request, response)) return
  if (isOptions(request, response)) return

  const space = request.query.space
  if (!checkQueryIsString(response, space)) return

  const settings = JSON.parse(request.body)

  const result = settingsSchema.safeParse(settings)
  if (!result.success) {
    logger.warn('Invalid settings', { settings })
    response.status(400).send('Bad Request')
    return
  } else {
    const ref = db.ref(space)
    ref.once('value', snapshot => {
      if (!snapshot.exists()) {
        logger.warn('space not found', { space })
        response.status(404).send('Not Found')
      } else {
        ref.child('data/settings').update(settings)
        response.status(200).send('OK')
      }
    })
  }
})

/**
 * Resolve queue
 * @param space query
 * @param key query
 * @param action 'approve' or 'reject'
 * @returns status 200 if success, status 400 if bad request
 */
const resolveQueue = https.onRequest((request, response) => {
  if (!isAllowedOrigin(request, response)) return
  if (isOptions(request, response)) return

  const space = request.query.space
  if (!checkQueryIsString(response, space)) return

  const queueKey = request.query.key
  if (!checkQueryIsString(response, queueKey)) return

  const action = request.query.action as 'approve' | 'reject'
  if (!checkQueryIsString(response, action)) return

  const ref = db.ref(`${space}/data/queue/${queueKey}`)
  if (action === 'approve') {
    ref.once('value', snapshot => {
      const queue = snapshot.val() as AddedQueue
      ref.remove()
      db.ref(`${space}/auth`).once('value', authSnapshot => {
        createSpotifyInstance({
          tokens: authSnapshot.val(),
          updateTokenCallback: newAuth => updateAuthCallback(space, newAuth, db),
          response,
        })
          .then(spotifySDK => sendQueue(spotifySDK, queue, response))
          .catch(error => logger.error('Failed to send queue', { error }))
      })
    })
  } else if (action === 'reject') {
    ref.remove()
    response.status(200).send('OK')
  } else {
    response.status(400).send('Bad Request')
  }
})

export {
  // client
  addQueue,
  getCurrentPlaying,
  // host
  // getSpaceData,
  updateAuth,
  updateSite,
  resolveQueue,
  updateAllpass,
}
