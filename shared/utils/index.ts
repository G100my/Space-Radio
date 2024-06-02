import type {} from 'spotify-web-api-js'

export function spotifyCoverPicker(imagesUrl: SpotifyApi.AlbumObjectSimplified['images']): string | undefined {
  return imagesUrl.length ? imagesUrl[imagesUrl.length - 1].url : undefined
}
