import ImageVinylRecord from '@/assets/vinyl-record.png'

export function spotifyCoverPicker(images) {
  return images.length ? images[images.length - 1].url : ImageVinylRecord
}

export const reduceDataCallback = i => ({
  album: {
    name: i.track.album.name,
    externalUrl: i.track.album.external_urls.spotify,
    coverUrl: spotifyCoverPicker(i.track.album.images),
  },
  artists: i.track.artists,
  id: i.track.id,
  name: i.track.name,
})
