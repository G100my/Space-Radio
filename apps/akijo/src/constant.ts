export interface TrackBaseInfo {
  name: SpotifyApi.TrackObjectSimplified['name']
  uri: SpotifyApi.TrackObjectSimplified['uri']
  preview_url: SpotifyApi.TrackObjectSimplified['preview_url']
  album: Pick<SpotifyApi.TrackObjectFull['album'], 'images' | 'name' | 'external_urls'>
  artists: Pick<SpotifyApi.ArtistObjectSimplified, 'external_urls' | 'name'>[]
}

export const routeMap = {
  C_login: 'login',
  C_search: 'search',
  C_playing: 'playing',
  C_collects: 'collects',
  C_playlist: 'my-playlist',
  C_tracks: 'tracks',
  H_index: 'host',
  H_setting: 'settings',
}

export const SPOTIFY_HOST_REDIRECT_URI = routeMap.H_index + '/' + routeMap.H_setting
