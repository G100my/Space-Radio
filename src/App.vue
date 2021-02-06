<template>
  <main>
    <router-view />
  </main>
</template>
<script>
export default {}
</script>
<style lang="scss">
:root {
  --primary-dark: #13192c;
  --secondary-dark: #0c0f1c;

  --primary-light: #f2f3f7;
  --secondary-light: #ffffff;

  --primary-highlight: #dd6e42;
  --secondary-highlight: #cf5626;

  --primary-neutral: #4b90c2;
  --secondary-neutral: #5aa4da;

  --ignore: #c0c0c0;
}
body {
  margin: 0;
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
  background-color: var(--primary-dark);
}
main {
  min-height: 100vh;
  min-width: 100%;
  color: var(--primary-light);
  display: flex;
  align-items: center;
}
h1,
h2 {
  margin: 0;
}
p {
  margin: 0;
}
a {
  text-decoration: none;
  text-decoration-color: var(--primary-neutral);
  &:visited {
    color: var(--ignore);
  }
  &:hover {
    color: var(--primary-neutral);
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
