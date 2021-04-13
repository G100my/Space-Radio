<template>
  <div class="hall">
    <div class="hall-container">
      <slot />
    </div>
  </div>
</template>
<style lang="scss">
.hall {
  flex: 1;
  box-sizing: border-box;
  background: gray;
  display: flex;
  align-items: center;
  justify-content: center;

  &-container {
    width: 60%;
  }
  .header {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    > h1 {
      font-size: 3rem;
    }
  }
  .content {
    display: flex;
    flex-direction: column;
  }
}
</style>
