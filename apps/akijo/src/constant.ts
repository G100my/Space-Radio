export interface TrackBaseInfo {
  name: SpotifyApi.TrackObjectSimplified['name']
  uri: SpotifyApi.TrackObjectSimplified['uri']
  preview_url: SpotifyApi.TrackObjectSimplified['preview_url']
  album: Pick<SpotifyApi.TrackObjectFull['album'], 'images' | 'name' | 'external_urls'>
  artists: Pick<SpotifyApi.ArtistObjectSimplified, 'external_urls' | 'name'>[]
  type: 'track'
}

export const routeMap = {
  Login: 'login',
  Search: 'search',
  Playing: 'playing',
  Collections: 'collects',
  Playlist: 'my-playlist',
  Tracks: 'tracks',
  NotFound: 'NotFound',
}
