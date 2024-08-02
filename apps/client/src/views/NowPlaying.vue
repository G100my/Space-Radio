<script setup lang="ts">
import placeholderImg from 'shared/assets/vinyl-record.png'
import { IconWrapper, spotifyCoverPicker, useAlert } from 'shared'
import { onMounted, ref } from 'vue'
import { Marquee } from 'shared'
import { getSpaceSite } from '@/utils'
import { spotifyWrappedAPI } from '@/api/spotifyWrappedAPI'
import { ODropdown, ODropdownItem, OTooltip } from '@oruga-ui/oruga-next'
import { usePlaylistStore, usePlaybackStore } from '@/stores'
import { computed } from 'vue'

const playlistStore = usePlaylistStore()
const playbackStore = usePlaybackStore()
const item = computed(() => playbackStore.current?.item)

const showLoading = ref(false)

function getNowPlayingTrack() {
  const space = getSpaceSite()?.space
  if (space) {
    showLoading.value = true
    return playbackStore.getCurrentPlaying(space).finally(() => {
      setTimeout(() => {
        showLoading.value = false
      }, 1000)
    })
  } else throw new Error("Can't get space.")
}
const amILiked = ref(false)
function amILikeThisTrack() {
  if (!item.value) return
  spotifyWrappedAPI.containsMySavedTracks([item.value.id]).then(res => res[0] && (amILiked.value = true))
}
function refresh() {
  getNowPlayingTrack().then(() => amILikeThisTrack())
}
const { open } = useAlert('已經是最新的歌曲資料囉！')
function handleClickRefresh() {
  if (playbackStore.judgeDisableGetCurrentPlaying()) {
    open()
    return
  }
  refresh()
}

onMounted(() => {
  refresh()
})

function handleLike() {
  if (!item.value) return
  if (!amILiked.value) spotifyWrappedAPI.addToMySavedTracks([item.value.id]).then(() => (amILiked.value = true))
  else spotifyWrappedAPI.removeFromMySavedTracks([item.value.id]).then(() => (amILiked.value = false))
}
function handleFetchList() {
  if (!playlistStore.lists?.total) playlistStore.getLists()
}
function handleAddToPlaylist(playlist: SpotifyApi.PlaylistObjectSimplified) {
  if (!item.value) return
  playlistStore.addTrackToPlaylist({ playlistId: playlist.id, trackUri: item.value.uri })
}
function handleExternalLink() {
  if (!item.value) return
  window.open(item.value.external_urls.spotify, '_blank')
}

let timer: ReturnType<typeof setTimeout> | undefined
const showTooltip = !navigator.share
const showCopied = ref(false)
function handleShare() {
  if (!item.value) return
  if (navigator.share) {
    navigator.share({
      title: item.value.name,
      text: `我在 Akijo 上聽到了這首歌，你也來聽聽吧！`,
      url: item.value.external_urls.spotify,
    })
  } else {
    navigator.clipboard.writeText(item.value.external_urls.spotify)
    showCopied.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      showCopied.value = false
      timer = undefined
    }, 2000)
  }
}
</script>
<template>
  <section class="flex h-full flex-col gap-7 pb-8">
    <div class="relative mx-auto min-h-fit w-3/4 flex-1">
      <aside class="flex-shrink-0 divide-y-2 overflow-hidden rounded-3xl border-2 shadow-lg shadow-slate-500">
        <template v-if="playbackStore.current">
          <div class="relative mx-auto w-full">
            <img :src="spotifyCoverPicker(item?.album.images) ?? placeholderImg" class="h-full w-full" />
          </div>

          <div class="space-y-2 px-4 py-6">
            <Marquee>{{ item?.name }}</Marquee>
            <Marquee>{{ item?.artists.map(i => i.name).join(', ') }}</Marquee>
            <Marquee
              >{{ item?.album.name }}
              <span class="text-xs">{{ item?.album.release_date ? `(${item?.album.release_date})` : '' }}</span>
            </Marquee>
            <!-- <Marquee class="text-xs">{{ track.genre.join(', ') }}</Marquee> -->
          </div>

          <div class="flex h-fit justify-end gap-6 px-6 py-3 text-3xl">
            <button type="button" @click="handleLike">
              <IconWrapper v-if="amILiked" name="heart-3-fill" />
              <IconWrapper v-else name="heart-add-2-line" />
            </button>

            <ODropdown teleport menuClass="" class="relative" position="right">
              <template #trigger>
                <button type="button" @click="handleFetchList">
                  <IconWrapper name="play-list-add-line" />
                </button>
              </template>
              <ODropdownItem
                v-for="i in playlistStore.lists?.items"
                :label="i.name"
                :key="i.id"
                @click="handleAddToPlaylist(i)"
              />
            </ODropdown>

            <button type="button" @click="handleExternalLink">
              <IconWrapper name="external-link-line" />
            </button>

            <OTooltip v-if="showTooltip" position="top" label="Copied!" :active="showCopied">
              <button>
                <IconWrapper name="share-forward-line" @click="handleShare" />
              </button>
            </OTooltip>

            <button v-else>
              <IconWrapper name="share-forward-line" @click="handleShare" />
            </button>
          </div>
        </template>
        <template v-else-if="playbackStore.current === null">
          <div class="flex h-[494px] w-full items-center justify-center">
            <p>目前似乎沒有正在播放的音樂...</p>
          </div>
        </template>
        <template v-else-if="playbackStore.current === undefined">
          <div class="flex h-[494px] w-full items-center justify-center">
            <p>欸...請工作人員重新登入一下...</p>
          </div>
        </template>
      </aside>
    </div>

    <div class="flex flex-1 items-center justify-center py-3">
      <button
        class="text-natural-white bg-system-success1 w-2/3 rounded-full py-3 text-center text-2xl"
        type="button"
        @click="handleClickRefresh"
      >
        Refresh
      </button>
    </div>
  </section>
</template>
