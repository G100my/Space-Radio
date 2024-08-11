export interface TrackBaseInfo {
  name: SpotifyApi.TrackObjectSimplified['name']
  uri: SpotifyApi.TrackObjectSimplified['uri']
  preview_url: SpotifyApi.TrackObjectSimplified['preview_url']
  album: Pick<SpotifyApi.TrackObjectFull['album'], 'images' | 'name' | 'external_urls'>
  artists: Pick<SpotifyApi.ArtistObjectSimplified, 'external_urls' | 'name'>[]
}

export const routeMap = {
  Index: 'index',
  Sites: 'sites',
  Queue: 'queue',
  Settings: 'settings',
  NotFound: '404',
}
