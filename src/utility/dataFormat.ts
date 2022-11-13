import ImageVinylRecord from '@/assets/vinyl-record.png'

// @ts-expect-error
export function spotifyCoverPicker(imagesUrl) {
  return imagesUrl.length ? imagesUrl[imagesUrl.length - 1].url : ImageVinylRecord
}

// @ts-expect-error
export const playlistTrackFormater = i => ({
  albumName: i.track.album.name,
  albumExternalUrl: i.track.album.external_urls.spotify,
  albumCoverUrl: spotifyCoverPicker(i.track.album.images),
  artists: i.track.artists,
  id: i.track.id,
  name: i.track.name,
})

// @ts-expect-error
export const topTrackFormater = ({ album, artists, id, name }) => ({
  albumName: album.name,
  albumExternalUrl: album.uri,
  albumCoverUrl: spotifyCoverPicker(album.images),
  artists,
  id,
  name,
})
