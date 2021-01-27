function transferTrackObjectFormat(track) {
  const artists = track.artists.map(item => ({ name: item.name, external_url: item.external_urls.spotify }))
  const imagesArray = track.album.images
  console.log(imagesArray[imagesArray.length - 1])
  const cover_url = imagesArray[imagesArray.length - 1].url

  return {
    name: track.name,
    artists,
    album: {
      name: track.album.name,
      cover_url,
      external_url: track.album.external_urls.spotify,
      release_date: track.album.release_date,
    },
    duration_ms: track.duration_ms,
    id: track.id,
    preview_url: track.preview_url,
  }
}

export { transferTrackObjectFormat }
