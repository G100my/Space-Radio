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
  font-size: 16px;
}

div {
  &::-webkit-scrollbar {
    width: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 6px;
  }
}
div:hover {
  &::-webkit-scrollbar-thumb {
    background-color: var(--secondary-neutral);
  }
}
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  background-color: var(--primary-dark);
}
main {
  color: var(--primary-light);
  max-height: 100vh;
  @media (min-width: 768px) {
    display: flex;
    min-height: 100vh;
  }
}
h1,
h2 {
  margin: 0;
}
h2 {
  font-size: 2.5rem;
  color: var(--primary-neutral);
  margin-left: 5px;
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
  display: inline-block;
  &:focus {
    outline: none;
  }
  svg {
    height: 16px;
    width: 16px;
    vertical-align: middle;
  }
}
.feature-buttons {
  font-size: 0;
  > button {
    font-size: 0;
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
</style>
