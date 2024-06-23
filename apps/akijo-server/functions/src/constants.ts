import { z } from 'zod'

export interface Site {
  need_review: boolean
  name: string
}

export const addQueueSchema = z.object({
  name: z.string(),
  uri: z.string(),
  preview_url: z.string(),
  album: z.object({
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
  }),
  artists: z.array(
    z.object({
      external_urls: z.object({
        spotify: z.string(),
      }),
      name: z.string(),
    })
  ),
})
export type AddQueueSchema = z.infer<typeof addQueueSchema>

export const SPOTIFY_SERVER_SCOPE = ['user-modify-playback-state', 'user-read-currently-playing']

export interface SpaceClientData {
  sites: { [site_id: string]: Site }
  settings: { all_pass: boolean }
  queue?: {
    [hash: string]: AddQueueSchema & { site: string }
  }
}
