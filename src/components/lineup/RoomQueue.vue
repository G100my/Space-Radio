<template>
  <div class="h-full overflow-y-auto flex flex-col">
    <TrackGridShell>
      <template #header>
        <header class="flex justify-between items-center pb-6">
          <h3 class="text-natural-gray2 text-2xl xl:text-4xl font-semibold">Next</h3>
          <img src="@/assets/images/Spotify_Logo_CMYK_Green.png" alt="Spotify" class="w-20" />
        </header>
      </template>
      <template #body>
        <div
          v-for="(orderKey, index) in totalQueue"
          :key="index"
          class="track flex items-center justify-around rounded-lg hover:bg-tertiary-dark bg-tertiary-dark bg-opacity-60 mb-2 py-3 px-2 mobile:px-4 xl:px-10"
        >
          <div class="status">
            <div v-if="orderKey.startsWith('normal')" class="numbere px-2 mobile:pr-4 xl:pr-10">
              <span>{{ index }}</span>
            </div>
            <!-- 暫定，命名後續調整 -->
            <div v-else-if="orderKey.startsWith('urgent')" class="arrow-up px-2 mobile:pr-4 xl:pr-10">
              <IconArrowUp />
            </div>
            <!-- 暫定，命名後續調整 -->
            <div v-else class="pending px-2 mobile:pr-4 xl:pr-10">
              <IconPending />
            </div>
          </div>

          <div class="song-details flex items-center" style="flex: 1 1 300px">
            <div class="album-img pr-4">
              <img :src="getImageUrl(trackData[orderKey])" alt="album photo" />
            </div>
            <div class="song">
              <div class="name text-natural-gray1 font-bold text-xs md:text-base">
                <BaseMarquee :text="trackData[orderKey].name" />
              </div>
              <div class="orderer text-primary text-xs md:text-base">
                <BaseMarquee :text="getOrderer(orderKey)" />
              </div>
            </div>
          </div>

          <div class="album text-natural-gray1 flex-auto hidden md:block">
            <div class="album-name text-xs md:text-base">
              <BaseMarquee>
                <a :href="trackData[orderKey].external_urls.spotify" target="_blank">{{
                  trackData[orderKey].album.name
                }}</a>
              </BaseMarquee>
            </div>
            <div class="album-author text-xs md:text-base">
              <BaseMarquee>
                <a
                  v-for="artist in trackData[orderKey].artists"
                  :key="artist.name"
                  :href="artist.external_urls.spotify"
                  target="_blank"
                  >{{ artist.name }}</a
                >
              </BaseMarquee>
            </div>
          </div>

          <div class="features justify-end hidden laptop:block space-x-4 xl:space-x-11">
            <template v-if="orderKey.startsWith('urgent')">
              <button class="btn-tertiary" type="button" @click="editNote(orderKey)">
                <IconEdit />
              </button>
              <button class="btn-tertiary" type="button" @click="urgent2normal(orderKey)">
                <IconArrowDown />
              </button>
            </template>
            <button
              v-if="orderKey.startsWith('normal')"
              class="btn-tertiary"
              type="button"
              @click="normal2urgent(orderKey)"
            >
              <IconArrowUp />
            </button>
            <button
              v-if="!orderKey.startsWith('pending')"
              class="btn-tertiary"
              type="button"
              @click="remove(orderKey, orderKey.startsWith('normal') ? 'normal' : 'urgent')"
            >
              <IconRemove />
            </button>
          </div>
          <!-- fixme -->
          <div class="more block laptop:hidden pr-2 cursor-pointer">
            <IconMore />
          </div>
        </div>
      </template>
    </TrackGridShell>
  </div>
</template>
<script>
import IconPending from '@/assets/icons/icon-spinner-loader.svg'
import IconEdit from '@/assets/icons/icon/edit.svg'
import IconArrowUp from '@/assets/icons/icon-arrow-up.svg'
import IconArrowDown from '@/assets/icons/icon-arrow-down.svg'
import IconRemove from '@/assets/icons/icon-remove.svg'
import IconMore from '@/assets/icons/icon-more.svg'

import { mapGetters } from 'vuex'
import TrackGridShell from '../template/TrackGridShell.vue'
import BaseMarquee from '../base/BaseMarquee.vue'

export default {
  components: {
    TrackGridShell,
    IconPending,
    IconEdit,
    IconArrowUp,
    IconArrowDown,
    IconRemove,
    IconMore,
    BaseMarquee,
  },
  emits: ['activeNoteDialog'],
  computed: {
    ...mapGetters(['trackData', 'totalQueue', 'normalQueue', 'urgentQueue', 'pendingQueue', 'userId']),
  },
  methods: {
    remove(queueKey, level) {
      this.$store.dispatch(`${level}Remove`, {
        queueKey,
        id: this.trackData[queueKey].id,
        trackNameForLog: this.trackData[queueKey].name,
      })
    },
    editNote(queueKey) {
      const trackNameForLog = this.trackData[queueKey].name
      const submitFunction = newNote => {
        this.$store.dispatch(`urgentEdit`, { queueKey, note: newNote })
      }
      this.$emit('activeNoteDialog', { queueKey, trackNameForLog, submitFunction })
    },
    urgent2normal(queueKey) {
      this.$store.dispatch('urgent2normal', {
        queueKey,
        id: this.trackData[queueKey].id,
        trackNameForLog: this.trackData[queueKey].name,
      })
    },
    normal2urgent(queueKey) {
      const trackNameForLog = this.trackData[queueKey].name
      const submitFunction = newNote => {
        this.$store.dispatch('normal2urgent', {
          queueKey,
          note: newNote,
          id: this.trackData[queueKey].id,
          trackNameForLog,
        })
      }
      this.$emit('activeNoteDialog', { queueKey, trackNameForLog, submitFunction })
    },
    getImageUrl(track) {
      const imagesArray = track.album.images
      const imageLastObject = imagesArray[imagesArray.length - 1]
      // fixme 忘記當初是抓最大張圖片還是最小張
      return imageLastObject ? imageLastObject.url : null
    },
    getOrderer(orderKey) {
      // eslint-disable-next-line no-useless-escape
      const type = orderKey.slice(0, orderKey.search(/\-/))
      switch (type) {
        case 'normal':
          return this.normalQueue[orderKey].orderer

        case 'urgent':
          return this.urgentQueue[orderKey].orderer

        case 'pending':
          return this.pendingQueue[orderKey].orderer

        default:
          return '???'
      }
    },
  },
}
</script>
