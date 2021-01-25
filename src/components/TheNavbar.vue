<template>
  <nav class="navbar">
    <h1>navbar</h1>
    <div>
      <ul />
    </div>
  </nav>
</template>
<script>
import { getImplicitGrantToken } from '../utility/Oauth.js'

export default {
  methods: {
    getImplicitGrantToken,
    show() {
      console.log(this.$store.state.token)
    },
  },
}
</script>
<style lang="scss">
.navbar {
  position: absolute;
  left: 0;
  width: 150px;
}
</style>
