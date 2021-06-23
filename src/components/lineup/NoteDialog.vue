<template>
  <span class="mask dialog" />
  <div class="dialog">
    <p class="dialog-header">Write your message.</p>
    <div class="dialog-body">
      <input v-model="currentNote.sender" class="sender" :placeholder="$store.getters.userName" />插播一首<span
        class="track-name"
        >{{ trackNameForLog }}</span
      >給<input v-model="currentNote.recipient" class="recipient" type="text" placeholder="everyone" />，<br /><textarea
        v-model="currentNote.message"
        class="message"
        cols="25"
        rows="3"
        placeholder="(Say something...)"
      />
    </div>
    <div class="dialog-footer">
      <button type="button" @click="submitHandler">Submit</button>
      <button type="button" @click="$emit('finish')">Cancel</button>
    </div>
    <p class="preview">{{ output }}</p>
  </div>
</template>
<script>
import { messageOutputMaker } from '@/utility/messageOutputMaker.js'

export default {
  props: {
    queueKey: {
      type: String,
      default: '',
    },
    trackNameForLog: {
      type: String,
      required: true,
    },
    submitFunction: {
      type: Function,
      required: true,
    },
  },
  emits: ['finish'],
  data() {
    return {
      currentNote: {
        sender: '',
        recipient: '',
        message: '',
      },
    }
  },
  computed: {
    output() {
      return messageOutputMaker(this.currentNote, this.trackNameForLog)
    },
  },
  created() {
    if (
      this.queueKey !== '' &&
      Object.prototype.hasOwnProperty.call(this.$store.state.Queue.urgent_queue, this.queueKey)
    ) {
      const editedNote = this.$store.state.Queue.urgent_queue[this.queueKey].note
      if (editedNote) {
        this.currentNote = { ...editedNote }
      } else {
        const previousSenderName = localStorage.getItem('jukebox_senderName')
        this.currentNote.sender = previousSenderName ? previousSenderName : this.$store.getters.userName
      }
    }
  },
  beforeUnmount() {
    if (this.currentNote.sender.length !== 0) localStorage.setItem('jukebox_senderName', this.currentNote.sender)
  },
  methods: {
    submitHandler() {
      const { sender, recipient, message } = this.currentNote
      this.submitFunction({
        sender: sender ? sender : this.$store.getters.userName,
        recipient,
        message,
      })
      this.$emit('finish')
    },
  },
}
</script>
<style lang="scss">
.dialog {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: fit-content;
  width: min-content;
  margin: auto;
  overflow: visible;
  border: 3px var(--secondary-neutral) solid;
  border-radius: var(--border-radius);
  z-index: 30;
  background-color: var(--primary-dark);
  &.mask {
    box-sizing: border-box;
    display: block;
    position: absolute;
    height: 100vh;
    width: 100vw;
    background-color: black;
    opacity: 0.3;
    z-index: 9;
  }

  .dialog-header {
    font-size: 1.5rem;
    font-weight: 600;
    padding: 5px 0;
    text-align: center;
    border-bottom: 1px var(--primary-light) solid;
  }
  .dialog-body {
    line-height: 1.8rem;
    padding: 5px 15px 0;
  }
  .track-name {
    color: var(--primary-highlight);
    margin: 0 5px;
  }
  .sender,
  .recipient,
  .message {
    color: var(--primary-neutral);
    background: none;
    border: none;
    caret-color: var(--primary-highlight);

    &:focus {
      outline: none;
    }
  }
  .sender,
  .recipient {
    text-transform: capitalize;
    font-size: 1.2rem;
    width: 5rem;
    text-align: center;
    border-bottom: 2px solid var(--ignore);
  }
  .sender {
    margin-right: 5px;
  }
  .recipient {
    margin-left: 5px;
  }
  .message {
    $line-height: 30px;
    margin-top: 5px;
    font-size: 16px;
    line-height: $line-height;
    background-attachment: local;
    background-clip: padding-box;
    padding-bottom: 2px;
    background-image: linear-gradient(
        to right,
        transparent 5%,
        var(--primary-dark) 5% 10%,
        transparent 10% 15%,
        var(--primary-dark) 15% 20%,
        transparent 20% 25%,
        var(--primary-dark) 25% 30%,
        transparent 30% 35%,
        var(--primary-dark) 35% 40%,
        transparent 40% 45%,
        var(--primary-dark) 45% 50%,
        transparent 50% 55%,
        var(--primary-dark) 55% 60%,
        transparent 60% 65%,
        var(--primary-dark) 65% 70%,
        transparent 70% 75%,
        var(--primary-dark) 75% 80%,
        transparent 80% 85%,
        var(--primary-dark) 85% 90%,
        transparent 90% 95%,
        var(--primary-dark) 95% 100%
      ),
      linear-gradient(to bottom, var(--primary-dark) $line-height - 1px, var(--ignore));
    background-size: 100% 100%, 100% $line-height;
  }
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding: 10px 0;
    button {
      padding: 4px 15px;
      margin-right: 10px;
    }
  }
  .preview {
    padding: 5px;
    text-transform: capitalize;
  }
}
</style>
