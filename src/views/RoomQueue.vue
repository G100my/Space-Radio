<template>
  <!-- eslint-disable vue/html-self-closing eslint-disable vue/no-parsing-error-->
  <div class="room-queue">
    <h2>Next On</h2>
    <div class="track-table">
      <div class="table-header track-cover">Cover</div>
      <div class="table-header track-name-artist">
        <p>Track</p>
        <p>Artists</p>
      </div>
      <div class="table-header track-album">Album</div>
      <div class="table-header track-time-data">
        <p>Duration Time</p>
        <p>Release Time</p>
      </div>
      <div class="table-header track-feature">Feature</div>
      <Track v-if="pendingQueue" :info="trackData['pending']" :is-pending="true" />
      <Track v-for="queueKey in urgentQueueKeys" :key="queueKey" :info="trackData[queueKey]" :is-urgent="true">
        <div class="feature-buttons">
          <button class="remove-button" type="button" @click="remove(queueKey, 'urgent')">
            <!-- prettier-ignore -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
          <button class="urgent2normal-button" type="button" @click="urgent2normal(queueKey)">
            <!-- prettier-ignore -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-down" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M1.646 6.646a.5.5 0 0 1 .708 0L8 12.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
              <path fill-rule="evenodd" d="M1.646 2.646a.5.5 0 0 1 .708 0L8 8.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
          <button class="edit-button" type="button" @click="editNote(queueKey)">
            <!-- prettier-ignore -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
          </button>
        </div>
      </Track>
      <Track v-for="queueKey in normalQueueKeys" :key="queueKey" :info="trackData[queueKey]">
        <div class="feature-buttons">
          <button class="remove-button" type="button" @click="remove(queueKey, 'normal')">
            <!-- prettier-ignore -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
          <button class="normal2urgent-button" type="button" @click="normal2urgent(queueKey)">
            <!-- prettier-ignore -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-up" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708l6-6z"/>
              <path fill-rule="evenodd" d="M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
            </svg>
          </button>
        </div>
      </Track>
    </div>
  </div>
</template>
<script>
import Track from '../components/Track.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    Track,
  },
  emits: ['activeNoteDialog'],
  computed: {
    ...mapGetters(['trackData', 'normalQueueKeys', 'urgentQueueKeys', 'pendingQueue']),
  },
  methods: {
    remove(queueKey, level) {
      this.$store.dispatch(`${level}Remove`, {
        queueKey,
        id: this.trackData[queueKey].id,
        trackName: this.trackData[queueKey].name,
      })
    },
    editNote(queueKey) {
      const trackName = this.trackData[queueKey].name
      const submitFunction = newNote => {
        this.$store.dispatch(`urgentEdit`, { queueKey, note: newNote })
      }
      this.$emit('activeNoteDialog', { queueKey, trackName, submitFunction })
    },
    urgent2normal(queueKey) {
      this.$store.dispatch('urgent2normal', {
        queueKey,
        id: this.trackData[queueKey].id,
        trackName: this.trackData[queueKey].name,
      })
    },
    normal2urgent(queueKey) {
      const trackName = this.trackData[queueKey].name
      const submitFunction = newNote => {
        this.$store.dispatch('normal2urgent', {
          queueKey,
          note: newNote,
          id: this.trackData[queueKey].id,
          trackName,
        })
      }
      this.$emit('activeNoteDialog', { queueKey, trackName, submitFunction })
    },
  },
}
</script>
<style lang="scss">
.room-queue {
  overflow: auto;
  display: flex;
  flex-direction: column;
  @media (min-width: 768px) {
    padding: 50px 7%;
  }

  h2 {
    font-size: 2.5rem;
    color: var(--primary-neutral);
    margin-left: 5px;
  }

  .track-table {
    padding: 15px;
    display: grid;
    grid-template-columns: min-content minmax(50px, 1fr) max-content;
    gap: 10px 10px;
    font-size: 0.7rem;
    @media (min-width: 768px) {
      grid-template-columns: min-content 2fr repeat(2, max-content) minmax(max-content, 1fr);
      gap: 25px 35px;
    }
    .table-header {
      > p {
        overflow: initial;
        text-overflow: initial;
      }
    }
    .table-header:not(.track-feature) {
      justify-self: start;
    }
    .table-header.track-name-artist {
      flex-direction: row;
      p:last-child::before {
        content: '/';
        margin-left: 5px;
        margin-right: 5px;
      }
    }
    > div:nth-child(-n + 3),
    > div:nth-child(5) {
      font-size: 1.2rem;
    }
    > div:nth-child(4) {
      text-align: right;
    }
  }

  .feature-buttons {
    font-size: 0;
    > button {
      font-size: 0;
      display: inline-block;
      border-color: var(--primary-neutral);
    }
    button + button {
      margin-left: 10px;
    }
    @media (min-width: 768px) {
      padding-left: 10px;
      padding-right: 10px;
      button + button {
        margin-left: 15px;
      }
    }
  }
}
</style>
