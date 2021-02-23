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

  --border-radius: 4px;
  --edge-gap: 15px;
  --edge-gap-n: -15px;
  font-size: 16px;
}
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  background-color: var(--primary-dark);
}
main {
  color: var(--primary-light);
  @media (min-width: 768px) {
    display: flex;
  }
}
h1,
h2 {
  margin: 0;
}
p {
  margin: 0;
}
a {
  color: var(--primary-light);
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
button {
  background-color: inherit;
  border-radius: var(--border-radius);
  border: 1px solid var(--primary-highlight);
  color: var(--primary-light);
  padding: 4px;
}
</style>
