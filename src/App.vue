<template>
  <div class="main-container">
    <TheNavbar />
    <TheHostControl />
  </div>
</template>
<script>
import TheNavbar from './components/TheNavbar.vue'
import TheHostControl from './components/TheHostControl.vue'

export default {
  components: {
    TheNavbar,
    TheHostControl,
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
    this.$spotifyAPI.setAccessToken(this.token)

    //

    const hash = window.location.hash
    // fixme 如果網址是帶有 token 的則導向驗證前的的頁面
    if (hash.includes('access_token')) {
      this.token = hash.substring(hash.search(/(?<=access_token=)[\w+]/), hash.indexOf('&token_type'))
      localStorage.setItem('token', this.token)
    } else {
      this.token = localStorage.getItem('token') || null
    }
  },
}
</script>
<style>
* {
  outline: 2px lightblue dashed;
}
body {
  padding-left: 150px;
  margin: 0;
}
.main-container {
  display: flex;
  height: 100vh;
  width: 100vw;
}
main {
  flex: 1;
  display: flex;
}
</style>
