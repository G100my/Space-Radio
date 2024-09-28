import type { Actions, Context, Track, Device } from '@spotify/web-api-ts-sdk'
import type { AccessToken } from '@spotify/web-api-ts-sdk'
import type { addQueueSchema, settingsSchema } from './schemas'
import type { z } from 'zod'

export interface ImageObj {
  height?: number
  url: string
  width?: number
}

export interface AuthParams {
  client_id: string
  redirect_uri: string
}

export interface FetchTokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: 3600
  refresh_token: string
  expires?: number

  timestamp: number
  scope: string // 'playlist-modify-private user-read-email user-read-private streaming user-modify-playback-state user-library-read user-library-modify playlist-modify-public user-read-playback-state user-read-currently-playing user-read-recently-played user-read-playback-position user-top-read'
}

export interface PlaybackStateOnlyTrack {
  device: Device
  repeat_state: string
  shuffle_state: boolean
  context: Context | null
  timestamp: number
  progress_ms: number
  is_playing: boolean
  item: Track
  currently_playing_type: string
  actions: Actions
}

export interface CustomAuth extends AccessToken {
  timestamp: number
}
export interface Site {
  need_review: boolean
  name: string
}
export type AddedQueue = z.infer<typeof addQueueSchema>
export interface SpaceClientData {
  sites?: { [site_id: string]: Site }
  settings?: SiteSettings
  queue?: {
    [hash: string]: AddedQueue & { site: string }
  }
}
export type SiteSettings = z.infer<typeof settingsSchema>
