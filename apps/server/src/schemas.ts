import { z } from 'zod'

export const addQueueSchema = z.object({
  name: z.string(),
  uri: z.string(),
  preview_url: z.string().optional().nullable(),
  album: z
    .object({
      images: z.array(
        z.object({
          url: z.string(),
          height: z.number().optional(),
          width: z.number().optional(),
        })
      ),
      name: z.string(),
      external_urls: z.object({
        spotify: z.string(),
      }),
    })
    .optional(),
  artists: z.array(
    z.object({
      external_urls: z.object({
        spotify: z.string(),
      }),
      name: z.string(),
    })
  ),
})
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

export const SPOTIFY_SERVER_SCOPE = ['user-modify-playback-state', 'user-read-currently-playing']

export const settingsSchema = z.object({
  top_switch: z.boolean(),
  space_name: z.string(),
  welcome_message: z.string(),
})
export type SiteSettings = z.infer<typeof settingsSchema>
