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