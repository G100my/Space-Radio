import { logger, region } from 'firebase-functions'
import { addQueueSchema, AddedQueue } from './schemas'
import admin = require('firebase-admin')
import { CustomAuth, checkQueryIsString, createSpotifyInstance, sendQueue, updateAuthCallback } from './utils'
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
  cors({ origin: clientAllowedOrigins, methods: 'POST' })(request, response, async () => {
    const site = request.query.site as string | undefined
    const spaceOrUid = request.query.space
    if (!checkQueryIsString(response, spaceOrUid)) return

    const queueResult = addQueueSchema.safeParse(request.body)
    if (!queueResult.success) {
      logger.warn(request.body, queueResult.error)
      response.status(400).send('Bad Request')
      return
    }
    const queue = queueResult.data

    let hostUid = (await db.ref('map/' + spaceOrUid).once('value')).val()
    if (!hostUid) {
      hostUid = spaceOrUid
    }

    const spaceRef = db.ref(hostUid)
    spaceRef
      .once('value', spaceSnapshot => {
        if (!spaceSnapshot.exists()) {
          logger.warn('space not found', { site, space: spaceOrUid, hostUid })
          response.status(404).send('Not Found')
          return Promise.reject()
        } else {
          return spaceSnapshot
        }
      })
      .then(spaceSnapshot => {
        const top_switch = spaceSnapshot.child('settings/top_switch').val()
        if (top_switch) {
          const auth = spaceSnapshot.child('auth').val() as CustomAuth
          createSpotifyInstance({
            tokens: auth,
            updateTokenCallback: newAuth => updateAuthCallback(hostUid, newAuth, db),
            response,
          }).then(spotifySDK => sendQueue(spotifySDK, queue, response))
        } else {
          const push2Queue = () => {
            const queueRef = spaceRef.child('queue')
            queueRef.push({ ...queue, site: null })
            response.status(200).send('OK')
          }

          if (!site) {
            push2Queue()
            return
          }

          const needReview = spaceSnapshot.child(`sites/${site}/need_review`)
          if (needReview.val()) push2Queue()
          else {
            const auth = spaceSnapshot.child('auth').val() as CustomAuth
            createSpotifyInstance({
              tokens: auth,
              updateTokenCallback: newAuth => updateAuthCallback(hostUid, newAuth, db),
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
  cors({ origin: clientAllowedOrigins, methods: 'GET' })(request, response, async () => {
    if (!checkQueryIsString(response, request.query.space)) return

    const spaceOrUid = request.query.space
    let hostUid = (await db.ref('map/' + spaceOrUid).once('value')).val()
    if (!hostUid) {
      hostUid = spaceOrUid
    }

    db.ref(hostUid + '/auth').once('value', snapshot => {
      if (!snapshot.exists()) {
        logger.warn('auth record not found', { space: spaceOrUid })
        response.status(404).send('Not Found')
        return
      }

      const auth = snapshot.val()

      createSpotifyInstance({
        tokens: auth,
        updateTokenCallback: newAuth => updateAuthCallback(hostUid, newAuth, db),
        response,
      })
        .then(spotifySDK => spotifySDK.player.getCurrentlyPlayingTrack())
        .then(currentPlaying => {
          console.log('🚀 ~ db.ref ~ currentPlaying:', currentPlaying)
          if (currentPlaying) {
            db.ref(spaceOrUid + '/settings/name').once('value', snapshot => {
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

// =============================================================================

/**
 * Resolve queue
 * @param space query
 * @param key query
 * @param action 'approve' or 'reject'
 * @returns status 200 if success, status 400 if bad request
 */
const resolveQueue = region('asia-east1').https.onRequest((request, response) => {
  cors({ origin: hostAllowedOrigins, allowedHeaders: ['Authorization'], methods: 'POST' })(
    request,
    response,
    async () => {
      const spaceOrUid = request.query.space
      if (!checkQueryIsString(response, spaceOrUid)) return
      let hostUid = (await db.ref('map/' + spaceOrUid).once('value')).val()
      if (!hostUid) {
        hostUid = spaceOrUid
      }

      const queueKey = request.query.key
      if (!checkQueryIsString(response, queueKey)) return

      const action = request.query.action as 'approve' | 'reject'
      if (!checkQueryIsString(response, action)) return

      const ref = db.ref(`${spaceOrUid}/queue/${queueKey}`)
      if (action === 'approve') {
        ref.once('value', snapshot => {
          const queue = snapshot.val() as AddedQueue
          db.ref(`${spaceOrUid}/auth`).once('value', authSnapshot => {
            createSpotifyInstance({
              tokens: authSnapshot.val() as CustomAuth,
              updateTokenCallback: newAuth => updateAuthCallback(hostUid, newAuth, db),
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
    }
  )
})

export {
  // client
  addQueue,
  getCurrentPlaying,
  // host
  resolveQueue,
}
