import type { AuthParams } from 'shared'
import { fetchAccessToken, generateWrappedSpotifyApi, refreshAccessToken, usePersonalStore } from 'shared'
import { storageKeys, type PersonalStoreState } from 'shared/stores/usePersonalStore'
import type { NavigationGuard, RouteLocationNormalized } from 'vue-router'

export const spotifyWrappedAPI = generateWrappedSpotifyApi(usePersonalStore)

export function handleAuthFromRoute(
  to: RouteLocationNormalized,
  params: {
    initRouteName: string // ex: routeMap.C_login
    validRouteName: string // ex: routeMap.C_playing
    redirectUrl: string
    authRefreshCallback?: () => void
  }
): ReturnType<NavigationGuard> {
  const personalStore = usePersonalStore()
  if (import.meta.env.DEV) console.log(personalStore.$state)

  if (personalStore.isTokenValid()) {
    if (!spotifyWrappedAPI.getAccessToken()) spotifyWrappedAPI.setAccessToken(personalStore.auth!.access_token)
    if (to.name === params.initRouteName) return { name: params.validRouteName }
  } else {
    const authorization_code = to.query.code as string | undefined
    const authRecordStr = localStorage.getItem(storageKeys.auth)
    const authRecord: PersonalStoreState['auth'] | null = authRecordStr ? JSON.parse(authRecordStr) : null

    if (import.meta.env.DEV) {
      console.log('🚀 ~ authorization_code:', authorization_code)
      console.log('🚀 ~ refreshToken:', authRecord)
    }

    if (authorization_code) {
      return fetchAccessToken(authorization_code, generateAuthParams(params.redirectUrl))
        .then(res => {
          personalStore.updateToken(res)
          spotifyWrappedAPI.setAccessToken(res.access_token)
        })
        .then(() => spotifyWrappedAPI.getMe())
        .then(res => personalStore.updateUserData(res))
        .then(() => {
          if (params.authRefreshCallback) params.authRefreshCallback()
        })
        .then(() => ({ name: params.validRouteName, query: undefined }))
    } else if (authRecord) {
      personalStore.updateToken(authRecord)
      if (personalStore.isTokenValid()) {
        spotifyWrappedAPI.setAccessToken(authRecord.access_token)
        return spotifyWrappedAPI
          .getMe()
          .then(res => personalStore.updateUserData(res))
          .then(() => ({ name: params.validRouteName }))
      } else {
        console.log(authRecord)

        return refreshAccessToken({
          refresh_token: authRecord.refresh_token,
          client_id: import.meta.env.VITE_CLIENT_ID,
        })
          .then(res => personalStore.updateToken(res))
          .then(() => spotifyWrappedAPI.getMe())
          .then(res => personalStore.updateUserData(res))
          .then(() => {
            if (params.authRefreshCallback) params.authRefreshCallback()
          })
          .then(() => ({ name: params.validRouteName }))
          .catch(e => {
            console.error(e)
            personalStore.clear()
            return { name: params.initRouteName }
          })
      }
    } else {
      if (to.name !== params.initRouteName) return { name: params.initRouteName }
    }
  }
}

export function generateAuthParams(path: string): AuthParams {
  return {
    client_id: import.meta.env.VITE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_BASE_URI + path,
  }
}
