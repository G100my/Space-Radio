import type { NavigationGuard, RouteLocationNormalized } from 'vue-router'
import { fetchAccessToken, refreshAccessToken, usePersonalStore } from '..'
import type SpotifyWebApi from 'spotify-web-api-js'
import { storageKeys, type PersonalStoreState } from '../stores/usePersonalStore'
import type { AuthParams, ImageObj } from '../types'

export function spotifyCoverPicker(imagesUrl: ImageObj[] | null | undefined): string | undefined {
  if (!imagesUrl) return undefined
  return imagesUrl.length ? imagesUrl[0].url : undefined
}

export function generateAuthParams(redirectPath: string): AuthParams {
  const url = import.meta.env.VITE_BASE_URI as string
  return {
    client_id: import.meta.env.VITE_CLIENT_ID,
    redirect_uri: url.endsWith('/') ? url + redirectPath : url + '/' + redirectPath,
  }
}
export function handleAuthFromRoute(
  to: RouteLocationNormalized,
  {
    client_id,
    initRouteName,
    validRouteName,
    redirectUrl,
    authRefreshCallback,
    spotifyWrappedAPI,
  }: {
    client_id: string
    initRouteName: string // ex: routeMap.Login
    validRouteName: string // ex: routeMap.Playing
    redirectUrl: string
    authRefreshCallback?: () => void
    spotifyWrappedAPI: SpotifyWebApi.SpotifyWebApiJs
  }
): ReturnType<NavigationGuard> {
  const personalStore = usePersonalStore()
  if (import.meta.env.DEV) console.log(personalStore.$state)

  if (personalStore.isTokenValid()) {
    if (!spotifyWrappedAPI.getAccessToken()) spotifyWrappedAPI.setAccessToken(personalStore.auth!.access_token)
    if (to.name === initRouteName) return { name: validRouteName }
  } else {
    const authorization_code = to.query.code as string | undefined
    const authRecordStr = localStorage.getItem(storageKeys.auth)
    const authRecord: PersonalStoreState['auth'] | null = authRecordStr ? JSON.parse(authRecordStr) : null

    if (import.meta.env.DEV) {
      console.log('🚀 ~ authorization_code:', authorization_code)
      console.log('🚀 ~ refreshToken:', authRecord)
    }

    if (authorization_code) {
      return fetchAccessToken(authorization_code, generateAuthParams(redirectUrl))
        .then(res => {
          personalStore.updateToken(res)
          spotifyWrappedAPI.setAccessToken(res.access_token)
        })
        .then(() => spotifyWrappedAPI.getMe())
        .then(res => personalStore.updateUserData(res))
        .then(() => {
          if (authRefreshCallback) authRefreshCallback()
        })
        .then(() => ({ name: validRouteName, query: undefined }))
    } else if (authRecord) {
      personalStore.reloadToken(authRecord)
      console.log('🚀 ~ personalStore.isTokenValid():', personalStore.isTokenValid())
      if (personalStore.isTokenValid()) {
        spotifyWrappedAPI.setAccessToken(authRecord.access_token)
        return spotifyWrappedAPI
          .getMe()
          .then(res => personalStore.updateUserData(res))
          .then(() => ({ name: validRouteName }))
      } else {
        console.log(authRecord)

        return refreshAccessToken({
          refresh_token: authRecord.refresh_token,
          client_id: client_id,
        })
          .then(res => personalStore.updateToken(res))
          .then(() => spotifyWrappedAPI.getMe())
          .then(res => personalStore.updateUserData(res))
          .then(() => {
            if (authRefreshCallback) authRefreshCallback()
          })
          .then(() => ({ name: validRouteName }))
          .catch(e => {
            console.error(e)
            personalStore.clear()
            return { name: initRouteName }
          })
      }
    } else {
      if (to.name !== initRouteName) return { name: initRouteName }
    }
  }
}
