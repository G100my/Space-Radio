/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { clientApi } from './api/cloudFunctionAPI'
import { useAlert, useLoading, useSnackbar } from 'shared'

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

function encrypt(text: string) {
  return btoa(text.toLowerCase()).toString()
}

function decrypt(text: string) {
  return atob(text).toString()
}

const storageKeys = {
  site: 'site',
  space: 'space',
}
export function setSpaceSite(params: { site?: string; space: string }) {
  const { site, space } = params
  if (site) sessionStorage.setItem(storageKeys.site, encrypt(site))
  sessionStorage.setItem(storageKeys.space, encrypt(space))
}
export function getSpaceSite(): { site?: string; space: string } | null {
  const siteRecord = sessionStorage.getItem(storageKeys.site)
  const spaceRecord = sessionStorage.getItem(storageKeys.space)
  if (!spaceRecord) return null
  if (!siteRecord) return { space: decrypt(spaceRecord) }
  else return { site: decrypt(siteRecord), space: decrypt(spaceRecord) }
}

const lastAddTimestampKey = 'ewfew3refebr45hg'
const limitTime = 30 * 1000

export function addQueue(...p: Parameters<typeof clientApi.addQueue>) {
  const record = localStorage.getItem(lastAddTimestampKey)
  const timestamp = record ? parseInt(record) : NaN
  if (isNaN(timestamp) || Date.now() - timestamp > limitTime) {
    useLoading().on()
    clientApi
      .addQueue(...p)
      .then(res => {
        if (res.ok) return res
        else return Promise.reject(res)
      })
      .then(() => {
        useSnackbar('已加入播放佇列中囉～\n要排隊，請稍等一下。', 'success')
        if (import.meta.env.PROD) localStorage.setItem(lastAddTimestampKey, Date.now().toString())
      })
      .catch(error => {
        if (error.status === 409) useSnackbar('無法在未播放任何歌曲的狀態下點歌', 'danger')
        else useSnackbar('加入播放佇列失敗，請稍後再試。', 'danger')
      })
      .finally(() => {
        useLoading().off()
      })
  } else {
    useAlert('欸...經費有限...不要這麼急著點嘛～').open()
  }
}
