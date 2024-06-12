<script setup lang="ts">
import img from '@/assets/_monkey.jpeg'
import placeholderImg from 'shared/assets/vinyl-record.png'
import { IconWrapper } from 'shared'
import { reactive, ref } from 'vue'
import Marquee from 'shared/components/Marquee.vue'

const trackInfo = reactive({
  name: 'Monkey',
  artist: ['George Michael'],
  album: 'Faith',
  year: '1987',
  genre: ['Pop', 'Rock', 'R&B'],
  cover: img,
  link: undefined,
})

const showCard = ref(false)
function handleCheck() {
  showCard.value = !showCard.value
}
</script>
<template>
  <section class="flex h-full flex-col">
    <div class="flex-0 relative mx-auto h-[500px] w-3/4">
      <Transition name="card">
        <aside
          id="test"
          v-if="showCard"
          class="divide-y-2 overflow-hidden rounded-3xl border-2 shadow-2xl shadow-slate-500"
        >
          <div class="relative mx-auto w-full">
            <img :src="trackInfo.cover ?? placeholderImg" class="h-full w-full" />
          </div>

          <div class="space-y-1 p-6 pl-10">
            <Marquee class="text-3xl">{{ trackInfo.name }}</Marquee>
            <Marquee class="text-2xl">{{ trackInfo.artist.join(', ') }}</Marquee>
            <Marquee class="text-xl"
              >{{ trackInfo.album }} <span class="text-sm">({{ trackInfo.year }})</span></Marquee
            >
            <Marquee class="text-xs">{{ trackInfo.genre.join(', ') }}</Marquee>
          </div>

          <div class="flex justify-end gap-6 px-6 py-3 text-3xl">
            <button type="button">
              <IconWrapper name="heart-add-fill" />
            </button>
            <button type="button">
              <IconWrapper name="play-list-add-line" />
            </button>
            <button type="button">
              <IconWrapper name="external-link-line" />
            </button>
            <!-- <button>
             <IconWrapper name="share-forward-line" />
            </button> -->
          </div>
        </aside>
      </Transition>
      <Transition name="cover">
        <aside v-if="!showCard" class="h-full overflow-hidden rounded-3xl border-2 shadow-2xl shadow-slate-500">
          <div class="flex h-full w-full items-center justify-center">
            <span class="text-9xl">?</span>
          </div>
        </aside>
      </Transition>
    </div>

    <div class="flex flex-1 items-center justify-center">
      <button
        class="text-natural-white bg-system-success1 w-2/3 rounded-full py-3 text-center text-2xl"
        type="button"
        @click="handleCheck"
      >
        {{ showCard ? '有猜到嗎？' : '現正播放？' }}
      </button>
    </div>
  </section>
</template>
<style>
.card-enter-active,
.card-leave-active,
.cover-enter-active,
.cover-leave-active {
  @apply absolute inset-0 transition-transform;
}
.card-enter-active,
.cover-enter-active {
  @apply duration-1000;
}

.card-enter-from,
.card-leave-to {
  transform: rotateY(90deg);
}
.card-enter-to,
.card-leave-from {
  transform: rotateY(0deg);
}
.cover-enter-from,
.cover-leave-to {
  transform: rotateY(-90deg);
}
.cover-enter-to,
.cover-leave-from {
  transform: rotateY(0deg);
}
</style>
