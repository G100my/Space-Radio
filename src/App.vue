<template>
  <main>
    <router-view />
  </main>
</template>
<script>
export default {}
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
ul {
  margin-block: 0;
  padding-inline-start: 0;
}
li {
  list-style: none;
}
</style>
