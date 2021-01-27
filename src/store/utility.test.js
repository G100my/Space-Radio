/* eslint-disable no-undef */
import { transferTrackObjectFormat } from './utility.js'

const track_object_sample = {
  album: {
    album_type: 'album',
    artists: [
      {
        external_urls: {
          spotify: 'https://open.spotify.com/artist/4yVuFEko89vcXJX1VYC1d2',
        },
        href: 'https://api.spotify.com/v1/artists/4yVuFEko89vcXJX1VYC1d2',
        id: '4yVuFEko89vcXJX1VYC1d2',
        name: 'Lim Giong',
        type: 'artist',
        uri: 'spotify:artist:4yVuFEko89vcXJX1VYC1d2',
      },
    ],
    external_urls: {
      spotify: 'https://open.spotify.com/album/6nfWWE5GJuLqgAsldLdEFd',
    },
    href: 'https://api.spotify.com/v1/albums/6nfWWE5GJuLqgAsldLdEFd',
    id: '6nfWWE5GJuLqgAsldLdEFd',
    images: [
      {
        height: 640,
        url: 'https://i.scdn.co/image/ab67616d0000b27381b356ef01c761686e116508',
        width: 640,
      },
      {
        height: 300,
        url: 'https://i.scdn.co/image/ab67616d00001e0281b356ef01c761686e116508',
        width: 300,
      },
      {
        height: 64,
        url: 'https://i.scdn.co/image/ab67616d0000485181b356ef01c761686e116508',
        width: 64,
      },
    ],
    name: "Millenium Mambo (Hou Hsiao Hsien's Original Motion Picture Soundtrack)",
    release_date: '2015-09-23',
    release_date_precision: 'day',
    total_tracks: 9,
    type: 'album',
    uri: 'spotify:album:6nfWWE5GJuLqgAsldLdEFd',
  },
  artists: [
    {
      external_urls: {
        spotify: 'https://open.spotify.com/artist/4yVuFEko89vcXJX1VYC1d2',
      },
      href: 'https://api.spotify.com/v1/artists/4yVuFEko89vcXJX1VYC1d2',
      id: '4yVuFEko89vcXJX1VYC1d2',
      name: 'Lim Giong',
      type: 'artist',
      uri: 'spotify:artist:4yVuFEko89vcXJX1VYC1d2',
    },
  ],
  disc_number: 1,
  duration_ms: 321986,
  explicit: false,
  external_ids: {
    isrc: 'FRZ810605192',
  },
  external_urls: {
    spotify: 'https://open.spotify.com/track/4kOH89gRg5k4vMMIdp2Mma',
  },
  href: 'https://api.spotify.com/v1/tracks/4kOH89gRg5k4vMMIdp2Mma',
  id: '4kOH89gRg5k4vMMIdp2Mma',
  is_local: false,
  is_playable: true,
  name: 'A Pure Person',
  popularity: 32,
  preview_url:
    'https://p.scdn.co/mp3-preview/e5718d75378b559cf05f54a2863025a8042390db?cid=774b29d4f13844c495f206cafdad9c86',
  track_number: 1,
  type: 'track',
  uri: 'spotify:track:4kOH89gRg5k4vMMIdp2Mma',
}

describe('Transfer Object format', () => {
  const expect_track_object = {
    name: 'A Pure Person',
    artists: [
      {
        name: 'Lim Giong',
        external_url: 'https://open.spotify.com/artist/4yVuFEko89vcXJX1VYC1d2',
      },
    ],
    album: {
      name: "Millenium Mambo (Hou Hsiao Hsien's Original Motion Picture Soundtrack)",
      cover_url: 'https://i.scdn.co/image/ab67616d0000485181b356ef01c761686e116508',
      external_url: 'https://open.spotify.com/album/6nfWWE5GJuLqgAsldLdEFd',
      release_date: '2015-09-23',
    },
    duration_ms: 321986,
    id: '4kOH89gRg5k4vMMIdp2Mma',
    preview_url:
      'https://p.scdn.co/mp3-preview/e5718d75378b559cf05f54a2863025a8042390db?cid=774b29d4f13844c495f206cafdad9c86',
  }

  test('transferTrackObjectFormat', () => {
    expect(transferTrackObjectFormat(track_object_sample)).toEqual(expect_track_object)
  })
})
