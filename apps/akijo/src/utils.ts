/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AuthParams } from 'shared'
import sticker1 from '@/assets/sticker/1.svg'
import sticker2 from '@/assets/sticker/2.svg'
import sticker3 from '@/assets/sticker/3.svg'
import sticker4 from '@/assets/sticker/4.svg'
import sticker5 from '@/assets/sticker/5.svg'
import sticker6 from '@/assets/sticker/6.svg'
import sticker7 from '@/assets/sticker/7.svg'
import sticker8 from '@/assets/sticker/8.svg'
import sticker9 from '@/assets/sticker/9.svg'
import sticker10 from '@/assets/sticker/10.svg'
import sticker11 from '@/assets/sticker/11.svg'
import sticker12 from '@/assets/sticker/12.svg'
import sticker13 from '@/assets/sticker/13.svg'
import sticker14 from '@/assets/sticker/14.svg'
import sticker15 from '@/assets/sticker/15.svg'
import sticker16 from '@/assets/sticker/16.svg'
import sticker17 from '@/assets/sticker/17.svg'
import sticker18 from '@/assets/sticker/18.svg'
import sticker19 from '@/assets/sticker/19.svg'
import sticker20 from '@/assets/sticker/20.svg'
import sticker21 from '@/assets/sticker/21.svg'
import sticker22 from '@/assets/sticker/22.svg'
import sticker23 from '@/assets/sticker/23.svg'
import sticker24 from '@/assets/sticker/24.svg'
import sticker25 from '@/assets/sticker/25.svg'
import sticker26 from '@/assets/sticker/26.svg'
import sticker27 from '@/assets/sticker/27.svg'
import sticker28 from '@/assets/sticker/28.svg'
import sticker29 from '@/assets/sticker/29.svg'
import sticker30 from '@/assets/sticker/30.svg'
import sticker31 from '@/assets/sticker/31.svg'

export function generateAuthParams(path: string): AuthParams {
  return {
    client_id: import.meta.env.VITE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_BASE_URI + path,
  }
}

// return sticker 1-31
export function randomSticker(): string {
  const random = Math.floor(Math.random() * 31) + 1
  return eval(`sticker${random}`)
}

// spotify:playlist:37i9dQZF1Fa1IIVtEpGUcU/tracks
export function analyzeURI(fullUri: string) {
  const [spotify, type, uri] = fullUri.split(':')
  return { type, uri }
}
