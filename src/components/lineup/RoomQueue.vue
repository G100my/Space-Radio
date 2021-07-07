<template>
  <div class="room-queue">
    <TrackGridShell>
      <template #header>
        <header class="flex justify-between items-center pb-6">
          <h3 class="text-natural-gray2 text-2xl xl:text-4xl font-semibold">Next</h3>
          <img src="@/assets/images/Spotify_Logo_CMYK_Green.png" alt="Spotify" class="w-20" />
        </header>
      </template>
      <template #body>
        <div 
          v-for="(playlist, index) in mockPlaylistdata" :key="index"
          class="playlist flex items-center justify-around rounded-lg hover:bg-tertiary-dark bg-tertiary-dark bg-opacity-60 mb-2  py-3 px-2 mobile:px-4 xl:px-10"
          >
          <div class="status">
            <div class="pending px-2 mobile:pr-4 xl:pr-10" v-if="playlist.status === 'pending'">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" fill="none"/>
                <path d="M12.0047 7.93999C11.5647 7.93999 11.2047 7.57999 11.2047 7.13999V3.7C11.2047 3.26 11.5647 2.9 12.0047 2.9C12.4447 2.9 12.8047 3.26 12.8047 3.7V7.13999C12.8047 7.57999 12.4447 7.93999 12.0047 7.93999ZM9.62472 8.72C9.98472 8.45999 10.0647 7.96 9.80472 7.6L7.78472 4.81999C7.52472 4.45999 7.02472 4.37999 6.66472 4.63999C6.30472 4.89999 6.22472 5.40001 6.48472 5.76001L8.50472 8.53999C8.66472 8.75999 8.90473 8.86001 9.14473 8.86001C9.30473 8.88001 9.48472 8.81999 9.62472 8.72ZM8.14473 10.74C8.28473 10.32 8.04472 9.85999 7.62472 9.73999L4.34473 8.68C3.92473 8.54 3.46473 8.78 3.34473 9.2C3.20473 9.62 3.44472 10.08 3.86472 10.2L7.14473 11.26C7.22473 11.28 7.30472 11.3 7.38472 11.3C7.72472 11.3 8.02472 11.08 8.14473 10.74ZM4.34473 15.32L7.62472 14.26C8.04472 14.12 8.28473 13.68 8.14473 13.26C8.00472 12.84 7.56472 12.62 7.14473 12.74L3.86472 13.8C3.44472 13.94 3.20473 14.38 3.34473 14.8C3.44473 15.14 3.76472 15.36 4.10472 15.36C4.18472 15.36 4.26473 15.36 4.34473 15.32ZM7.76472 19.18L9.80472 16.4C10.0647 16.04 9.98472 15.54 9.62472 15.28C9.26472 15.02 8.76472 15.1 8.50472 15.46L6.48472 18.24C6.22472 18.6 6.30472 19.1 6.66472 19.36C6.80472 19.46 6.96472 19.52 7.12472 19.52C7.36472 19.52 7.60472 19.4 7.76472 19.18ZM12.8047 20.3V16.86C12.8047 16.42 12.4447 16.06 12.0047 16.06C11.5647 16.06 11.2047 16.42 11.2047 16.86V20.3C11.2047 20.74 11.5647 21.1 12.0047 21.1C12.4447 21.1 12.8047 20.74 12.8047 20.3ZM17.3647 19.36C17.7247 19.1 17.8047 18.6 17.5447 18.24L15.5247 15.46C15.2647 15.1 14.7647 15.02 14.4047 15.28C14.0447 15.54 13.9647 16.04 14.2247 16.4L16.2447 19.18C16.4047 19.4 16.6447 19.5 16.8847 19.5C17.0447 19.52 17.2247 19.46 17.3647 19.36ZM20.6647 14.82C20.8047 14.4 20.5647 13.94 20.1447 13.82L16.8647 12.76C16.4447 12.62 15.9847 12.86 15.8647 13.28C15.7247 13.7 15.9647 14.16 16.3847 14.28L19.6647 15.34C19.7447 15.36 19.8247 15.38 19.9047 15.38C20.2447 15.36 20.5647 15.14 20.6647 14.82ZM16.8647 11.26L20.1447 10.2C20.5647 10.06 20.8047 9.62 20.6647 9.2C20.5247 8.78 20.0847 8.56 19.6647 8.68L16.3847 9.73999C15.9647 9.87999 15.7247 10.32 15.8647 10.74C15.9647 11.08 16.2847 11.3 16.6247 11.3C16.7047 11.3 16.7847 11.28 16.8647 11.26ZM15.5047 8.53999L17.5247 5.76001C17.7847 5.40001 17.7047 4.89999 17.3447 4.63999C16.9847 4.37999 16.4847 4.45999 16.2247 4.81999L14.2047 7.6C13.9447 7.96 14.0247 8.45999 14.3847 8.72C14.5247 8.81999 14.6847 8.88 14.8447 8.88C15.1047 8.88 15.3447 8.75999 15.5047 8.53999Z" fill="#9595A8"/>
              </svg>
            </div>
            <!-- 暫定，命名後續調整 -->
            <div class="arrow-up px-2 mobile:pr-4 xl:pr-10" v-if="playlist.status === 'arrowUp'">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" fill="none"/>
                <path d="M17.5651 10.76C17.4051 10.92 17.2051 11 17.0051 11C16.8051 11 16.6051 10.92 16.4451 10.76L12.8051 7.12001V18.8C12.8051 19.24 12.4451 19.6 12.0051 19.6C11.5651 19.6 11.2051 19.24 11.2051 18.8V7.12001L7.56506 10.74C7.24506 11.06 6.74505 11.06 6.42505 10.74C6.10505 10.42 6.10505 9.92 6.42505 9.6L11.4251 4.62001C11.7451 4.30001 12.2451 4.30001 12.5451 4.62001L17.5451 9.6C17.8851 9.94 17.8851 10.44 17.5651 10.76Z" fill="#9595A8"/>
              </svg>
            </div>
            <!-- 暫定，命名後續調整 -->
            <div class="numbere px-2 mobile:pr-4 xl:pr-10"  v-if="playlist.status === 'number'">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0)">
                  <rect width="24" height="24" fill="none"/>
                  <path d="M14.0916 6.36364H11.7791L8.89844 8.1875V10.3693L11.5632 8.69886H11.6314V18H14.0916V6.36364Z" fill="#9595A8"/>
                </g>
                <defs>
                <clipPath id="clip0">
                  <rect width="24" height="24" fill="white"/>
                </clipPath>
                </defs>
              </svg>
            </div>
          </div>
          <div class="song-details flex items-center" style="flex: 1 1 300px">
            <div class="album-img pr-4">
              <img :src="playlist.albumPhotoSrc" alt="album photo">
            </div>
            <div class="song">
              <p class="name text-natural-gray1 font-bold text-xs md:text-base">{{ playlist.songName }}</p>
              <p class="orderer text-primary text-xs md:text-base">{{ playlist.orderer }}</p>
            </div>
          </div> 
          <div class="album text-natural-gray1 flex-auto hidden md:block">
            <div class="album-name text-xs md:text-base">{{ playlist.albumName }}</div>
            <div class="album-author  text-xs md:text-base">{{ playlist.albumAuthor }}</div>
          </div>
          <div class="features flex justify-end hidden laptop:block">
            <button class="mr-4 xl:mr-11">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" fill="none"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.6089 18.5667C12.6089 18.1525 12.9447 17.8167 13.3589 17.8167H18.9998C19.414 17.8167 19.7498 18.1525 19.7498 18.5667C19.7498 18.9809 19.414 19.3167 18.9998 19.3167H13.3589C12.9447 19.3167 12.6089 18.9809 12.6089 18.5667Z" fill="#F8FAFC"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M15.5145 4.45105C14.6697 3.75404 13.4247 3.87872 12.7322 4.72904L4.32116 15.5369C4.03887 15.8987 3.93631 16.3688 4.03887 16.8164L4.77101 20L8.02047 19.9581C8.47844 19.953 8.90696 19.7394 9.18926 19.3776C9.18926 19.3776 17.6744 8.47371 17.7049 8.42363C18.2786 7.48848 17.9902 6.26309 17.0621 5.68667C17.0621 5.68667 15.5612 4.48887 15.5145 4.45105ZM16.267 7.44022C16.2941 7.36015 16.2703 7.26206 16.1713 7.20057C16.1139 7.16495 16.0586 7.12592 16.0057 7.08368L15.2493 6.47994C14.8737 6.18011 14.4783 5.8644 14.4488 5.84053L14.4363 5.83043C14.321 5.73527 14.1487 5.75585 14.0593 5.85666L5.74476 16.5405L6.12947 18.2133L7.90854 18.1904L9.17048 16.5686C9.9664 15.5456 11.0279 14.1811 12.0904 12.8151C13.1529 11.449 14.2162 10.0816 15.0157 9.05268C15.4155 8.53814 15.749 8.10864 15.9834 7.80638C16.1007 7.65511 16.1926 7.53646 16.2554 7.45518L16.267 7.44022ZM16.3378 7.3481L16.3345 7.35243C16.3541 7.32559 16.3606 7.31809 16.3378 7.3481Z" fill="#F8FAFC"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.3231 6.99741C11.619 6.61676 12.1675 6.54807 12.5481 6.84399L15.1474 8.86464C15.528 9.16056 15.5967 9.70903 15.3008 10.0897C15.0049 10.4703 14.4564 10.539 14.0757 10.2431L11.4765 8.22244C11.0959 7.92652 11.0272 7.37805 11.3231 6.99741Z" fill="#F8FAFC"/>
              </svg>
            </button> 
            <button class="mr-4 xl:mr-11">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" fill="none"/>
                <path d="M17.5651 14.38L12.5651 19.36C12.4051 19.52 12.2051 19.6 12.0051 19.6C11.8051 19.6 11.6051 19.52 11.4451 19.36L6.44507 14.38C6.12507 14.06 6.12507 13.56 6.44507 13.24C6.76507 12.92 7.26508 12.92 7.58508 13.24L11.2251 16.86V5.2C11.2251 4.76 11.5851 4.4 12.0251 4.4C12.4651 4.4 12.8251 4.76 12.8251 5.2V16.88L16.4651 13.26C16.7851 12.94 17.2851 12.94 17.6051 13.26C17.8851 13.56 17.8851 14.06 17.5651 14.38Z" fill="#F8FAFC"/>
              </svg>
            </button> 
            <button>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" fill="none"/>
                <path d="M18.4853 8.68L17.8653 20.24C17.8453 20.66 17.4853 21 17.0653 21H6.92527C6.50527 21 6.14527 20.66 6.12527 20.24L5.50527 8.68C5.48527 8.24 5.82528 7.85999 6.26528 7.83999C6.70528 7.81999 7.08527 8.16 7.10527 8.6L7.68528 19.4H16.3053L16.8853 8.6C16.9053 8.16 17.2853 7.81999 17.7253 7.83999C18.1653 7.85999 18.5053 8.24 18.4853 8.68ZM20.6053 6C20.6053 6.44 20.2453 6.8 19.8053 6.8H4.20527C3.76527 6.8 3.40527 6.44 3.40527 6C3.40527 5.56 3.76527 5.2 4.20527 5.2H8.60527V3.4C8.60527 3.02 8.86526 2.8 9.24526 2.8H14.7653C15.1453 2.8 15.4053 3.02 15.4053 3.4V5.2H19.8053C20.2453 5.2 20.6053 5.56 20.6053 6ZM10.0053 5.2H14.0053V4.2H10.0053V5.2ZM10.3453 18.2C10.7453 18.2 11.0453 17.82 11.0453 17.44L10.8453 8.8C10.8453 8.42 10.5253 8.1 10.1253 8.1C9.74527 8.1 9.42526 8.41999 9.44526 8.81999L9.64526 17.48C9.64526 17.86 9.96526 18.2 10.3453 18.2ZM13.6453 18.2C14.0253 18.2 14.3453 17.88 14.3453 17.5L14.5453 8.86001C14.5453 8.48001 14.2453 8.13999 13.8653 8.13999C13.4653 8.13999 13.1653 8.43999 13.1453 8.81999L12.9453 17.46C12.9253 17.86 13.2453 18.2 13.6453 18.2C13.6253 18.2 13.6253 18.2 13.6453 18.2Z" fill="#F8FAFC"/>
              </svg>
            </button> 
          </div>
          <div class="more block laptop:hidden pr-2 cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" fill="none"/>
              <path d="M7.00498 13.4C6.64498 13.4 6.26498 13.24 6.00498 12.98C5.74498 12.72 5.60498 12.36 5.60498 12C5.60498 11.64 5.76498 11.28 6.00498 11C6.26498 10.74 6.62498 10.6 7.00498 10.6C7.36498 10.6 7.72499 10.76 7.98499 11C8.24499 11.26 8.40498 11.62 8.40498 12C8.40498 12.36 8.24499 12.72 7.98499 12.98C7.74499 13.26 7.36498 13.4 7.00498 13.4ZM13.005 12.98C13.265 12.72 13.425 12.36 13.425 12C13.425 11.64 13.265 11.28 13.005 11C12.745 10.74 12.385 10.6 12.025 10.6C11.665 10.6 11.285 10.76 11.025 11C10.765 11.26 10.625 11.62 10.625 12C10.625 12.36 10.785 12.72 11.025 12.98C11.285 13.24 11.645 13.4 12.025 13.4C12.365 13.4 12.745 13.26 13.005 12.98ZM18.005 12.98C18.265 12.72 18.425 12.36 18.425 12C18.425 11.64 18.265 11.28 18.005 11C17.745 10.74 17.385 10.6 17.025 10.6C16.665 10.6 16.285 10.76 16.025 11C15.765 11.26 15.625 11.62 15.625 12C15.625 12.36 15.785 12.72 16.025 12.98C16.285 13.24 16.645 13.4 17.025 13.4C17.365 13.4 17.745 13.26 18.005 12.98Z" fill="#F8FAFC"/>
            </svg>
          </div>
        </div>
        <!-- <TrackGridItem v-if="pendingQueue" :info="trackData['pending']" :is-pending="true">
          <p class="pending">pending...</p>
        </TrackGridItem>
        <TrackGridItem
          v-for="queueKey in Object.keys(urgentQueue)"
          :key="queueKey"
          :info="trackData[queueKey]"
          :is-urgent="true"
        >
          <template v-if="userId === urgentQueue[queueKey].added_by">
            <button class="remove-button" type="button" @click="remove(queueKey, 'urgent')">
              prettier-ignore
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
            <button class="urgent2normal-button" type="button" @click="urgent2normal(queueKey)">
              prettier-ignore
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-down" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1.646 6.646a.5.5 0 0 1 .708 0L8 12.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                <path fill-rule="evenodd" d="M1.646 2.646a.5.5 0 0 1 .708 0L8 8.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
            <button class="edit-button" type="button" @click="editNote(queueKey)">
              prettier-ignore
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
              </svg>
            </button>
          </template>
        </TrackGridItem>
        <TrackGridItem v-for="queueKey in Object.keys(normalQueue)" :key="queueKey" :info="trackData[queueKey]">
          <template v-if="userId === normalQueue[queueKey].added_by">
            <button class="remove-button" type="button" @click="remove(queueKey, 'normal')">
              prettier-ignore
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
            <button class="normal2urgent-button" type="button" @click="normal2urgent(queueKey)">
              prettier-ignore
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-up" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708l6-6z"/>
                <path fill-rule="evenodd" d="M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
              </svg>
            </button>
          </template>
        </TrackGridItem> -->
      </template>
    </TrackGridShell>
  </div>
</template>
<script>
import TrackGridItem from '../template/TrackGridItem.vue'
import TrackGridShell from '../template/TrackGridShell.vue'
import { mapGetters } from 'vuex'
import albumPhotoSrc from '@/assets/images/fake-album-photo.png'

export default {
  components: {
    TrackGridItem,
    TrackGridShell,
  },
  emits: ['activeNoteDialog'],
  data() {
    return {
      mockPlaylistdata: [
        {
          status: "pending",
          albumPhotoSrc: albumPhotoSrc,
          songName: "Until Our Next Adventure",
          orderer: "Lo",
          albumName: "Album Name",
          albumAuthor: "Coldplay"
        },
        {
          status: "number",
          albumPhotoSrc: albumPhotoSrc,
          songName: "Have a nice day",
          orderer: "PH",
          albumName: "Album Name",
          albumAuthor: "Bon Jovi"
        },
      ]
    }
  },
  computed: {
    ...mapGetters(['trackData', 'normalQueue', 'urgentQueue', 'pendingQueue', 'userId']),
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
  },
}
</script>
<style lang="scss">
.room-queue {
  transition: flex 0.3s ease-in-out;
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  h2 {
    font-size: 2.5rem;
  }
}
</style>
