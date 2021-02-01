<template>
  <main>
    <div class="sidebar-area">
      <Sidebar />
    </div>
    <div class="view">
      <div class="search">
        search
        <div>
          <button style="height: 30px" @click="getImplicitGrantToken">getImplicitGrantToken</button>
        </div>
      </div>
      <div>
        <TheRoomQueue />
      </div>
    </div>
    <PlaylistContent />
  </main>
</template>
<script>
import { getImplicitGrantToken } from './utility/Oauth.js'
import Sidebar from './views/Sidebar.vue'
// import TheHostControl from './components/TheHostControl.vue'
import TheRoomQueue from './components/TheRoomQueue.vue'
import PlaylistContent from './views/PlaylistContent.vue'

export default {
  components: {
    // TheHostControl,
    PlaylistContent,
    Sidebar,
    TheRoomQueue,
  },
  data() {
    return {
      token: null,
    }
  },
  watch: {
    token(newValue) {
      this.$store.commit('setToken', newValue)
    },
  },
  created() {
    const hash = window.location.hash
    // fixme 如果網址是帶有 token 的則導向驗證前的的頁面
    if (hash.includes('access_token')) {
      this.token = hash.substring(hash.search(/(?<=access_token=)[\w+]/), hash.indexOf('&token_type'))
      localStorage.setItem('token', this.token)
    } else {
      this.token = localStorage.getItem('token') || null
    }
    this.$spotifyAPI.setAccessToken(this.token)
  },
  methods: {
    getImplicitGrantToken,
  },
}
</script>
<style lang="scss">
* {
  outline: 1px lightblue dashed;
}
body {
  margin: 0;
  font-size: 18px;
}
main {
  height: 100vh;
  width: 100vw;
  display: flex;
}
.sidebar-area {
  flex: 0 0 250px;
  padding: 20px;
  display: flex;
  align-items: stretch;
}
.view {
  flex: 1;
}
.search {
  height: 50px;
}
h1 {
  margin: 0;
}
p {
  margin: 0;
}
a {
  text-decoration: none;
  &:hover {
    filter: invert(0.5);
  }
}
li {
  list-style: none;
}
</style>
