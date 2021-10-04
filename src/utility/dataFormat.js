import ImageVinylRecord from '@/assets/vinyl-record.png'

export function spotifyCoverPicker(images) {
  return images.length ? images[images.length - 1].url : ImageVinylRecord
}
