import { logger, region } from 'firebase-functions'
import { addQueueSchema, AddedQueue, settingsSchema } from './schemas'
import admin = require('firebase-admin')
import { CustomAuth, checkQueryIsString, createSpotifyInstance, sendQueue, updateAuthCallback } from './utils'
import { type AccessToken } from '@spotify/web-api-ts-sdk'
import cors = require('cors')

const clientAllowedOrigins = ['https://jukebox.akijo.space', 'http://localhost:2405']
const hostAllowedOrigins = ['https://jukebox-host.akijo.space', 'http://localhost:2407']

admin.initializeApp({
  databaseURL: 'https://akijo-space.asia-southeast1.firebasedatabase.app/',
})

// firebase realtime database
const db = admin.database()

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

/**
 * Add queue to current host
 * @param site query
 * @param space query
 * @param queue body
 * @returns status 200 if success, status 400 if bad request, status 404 if site or space not found, status 500 if failed to add queue to current user
 */
const addQueue = region('asia-east1').https.onRequest((request, response) => {
  cors({ origin: clientAllowedOrigins, methods: 'POST' })(request, response, () => {
    const site = request.query.site as string | undefined
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
        const top_switch = spaceSnapshot.child('data/settings/top_switch').val()
        if (top_switch) {
          const auth = spaceSnapshot.child('auth').val() as CustomAuth
          createSpotifyInstance({
            tokens: auth,
            updateTokenCallback: newAuth => updateAuthCallback(space, newAuth, db),
            response,
          }).then(spotifySDK => sendQueue(spotifySDK, queue, response))
        } else {
          const push2Queue = () => {
            const queueRef = spaceRef.child('data/queue')
            queueRef.push({ ...queue, site: null })
            response.status(200).send('OK')
          }

          if (!site) {
            push2Queue()
            return
          }

          const needReview = spaceSnapshot.child(`data/sites/${site}/need_review`)
          if (needReview.val()) push2Queue()
          else {
            const auth = spaceSnapshot.child('auth').val() as CustomAuth
            createSpotifyInstance({
              tokens: auth,
              updateTokenCallback: newAuth => updateAuthCallback(space, newAuth, db),
              response,
            }).then(spotifySDK => sendQueue(spotifySDK, queue, response))
          }
        }
      })
  })
})
/**
 * Get current playing track
 * @param space query
 * @returns current playing track, status 500 if failed to get current playing track
 */

const getCurrentPlaying = region('asia-east1').https.onRequest((request, response) => {
  cors({ origin: clientAllowedOrigins, methods: 'GET' })(request, response, () => {
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
              response.status(200).send({ ...currentPlaying, spaceName: snapshot.val() })
            })
          } else {
            response.status(204).send()
          }
        })
        .catch(error => logger.error('Failed to get current playing track', { error }))
    })
  })
})

/**
 * Update host auth
 * @param space query
 * @param body auth
 * @returns status 200 if success, status 404 if space not found
 */
const updateAuth = region('asia-east1').https.onRequest((request, response) => {
  cors({ origin: hostAllowedOrigins, methods: 'POST' })(request, response, () => {
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
const updateSite = region('asia-east1').https.onRequest((request, response) => {
  cors({ origin: hostAllowedOrigins, methods: 'POST' })(request, response, () => {
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
})

/**
 * Update allpass
 * @param space query
 * @param body settings
 * @returns status 200 if success, status 400 if bad request, status 404 if space not found
 */
const updateAllpass = region('asia-east1').https.onRequest((request, response) => {
  cors({ origin: hostAllowedOrigins, methods: 'POST' })(request, response, () => {
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
})

/**
 * Resolve queue
 * @param space query
 * @param key query
 * @param action 'approve' or 'reject'
 * @returns status 200 if success, status 400 if bad request
 */
const resolveQueue = region('asia-east1').https.onRequest((request, response) => {
  cors({ origin: hostAllowedOrigins, methods: 'POST' })(request, response, () => {
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
        db.ref(`${space}/auth`).once('value', authSnapshot => {
          createSpotifyInstance({
            tokens: authSnapshot.val() as CustomAuth,
            updateTokenCallback: newAuth => updateAuthCallback(space, newAuth, db),
            response,
          })
            .then(spotifySDK => sendQueue(spotifySDK, queue, response))
            .then(() => ref.remove())
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
