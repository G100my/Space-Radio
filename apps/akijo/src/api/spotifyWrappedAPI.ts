import type { AuthParams } from 'shared'
import { fetchAccessToken, generateWrappedSpotifyApi, refreshAccessToken, usePersonalStore } from 'shared'
import { storageKeys } from 'shared/stores/usePersonalStore'
import type { NavigationGuard, RouteLocationNormalized } from 'vue-router'

export const spotifyWrappedAPI = generateWrappedSpotifyApi(usePersonalStore)

export function handleAuthFromRoute(
  to: RouteLocationNormalized,
  redirect: {
    initRouteName: string // ex: routeMap.C_login
    validRouteName: string // ex: routeMap.C_playing
  }
): ReturnType<NavigationGuard> {
  const personalStore = usePersonalStore()
  if (import.meta.env.DEV) console.log(personalStore.$state)

  if (personalStore.isTokenValid()) {
    if (!spotifyWrappedAPI.getAccessToken()) spotifyWrappedAPI.setAccessToken(personalStore.access_token)
    if (to.name === redirect.initRouteName) return { name: redirect.validRouteName }
  } else {
    const authorization_code = to.query.code as string | undefined
    const refreshToken = localStorage.getItem(storageKeys.refreshToken)

    if (import.meta.env.DEV) {
      console.log('🚀 ~ authorization_code:', authorization_code)
      console.log('🚀 ~ refreshToken:', refreshToken)
    }

    if (authorization_code) {
      return fetchAccessToken(authorization_code, generateAuthParams(redirect.validRouteName))
        .then(res => personalStore.updateToken(res))
        .then(() => ({ name: redirect.validRouteName, query: undefined }))
    } else if (refreshToken) {
      return refreshAccessToken({ refresh_token: refreshToken, client_id: import.meta.env.VITE_CLIENT_ID })
        .then(() => true)
        .catch(e => {
          console.error(e)
          personalStore.clear()
          return { name: redirect.initRouteName }
        })
    } else if (to.name !== redirect.initRouteName) return { name: redirect.initRouteName }
  }
}

export function generateAuthParams(path: string): AuthParams {
  return {
    client_id: import.meta.env.VITE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_BASE_URI + path,
  }
}
