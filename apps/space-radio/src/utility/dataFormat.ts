import { spotifyCoverPicker } from 'shared'
import ImageVinylRecord from '../assets/vinyl-record.png'

export interface FormattedTrack {
  albumName: SpotifyApi.AlbumObjectSimplified['name']
  albumExternalUrl: SpotifyApi.AlbumObjectSimplified['external_urls']['spotify']
  coverUrl: string
  artists: SpotifyApi.ArtistObjectSimplified[]
  id: string
  name: string
}
export const playlistTrackFormater = (
  i: SpotifyApi.TrackObjectFull | SpotifyApi.TrackObjectSimplified
): FormattedTrack => {
  const base = {
    artists: i.artists,
    id: i.id,
    name: i.name,
  }
  if ('album' in i) {
    return {
      albumName: i.album.name,
      albumExternalUrl: i.album.external_urls.spotify,
      coverUrl: spotifyCoverPicker(i.album.images) ?? ImageVinylRecord,
      ...base,
    }
  } else {
    return { albumName: '', albumExternalUrl: '', coverUrl: '', ...base }
  }
}

export const topTrackFormater = ({ album, artists, id, name }: SpotifyApi.TrackObjectFull): FormattedTrack => ({
  albumName: album.name,
  albumExternalUrl: album.uri,
  coverUrl: spotifyCoverPicker(album.images) ?? ImageVinylRecord,
  artists,
  id,
  name,
})
