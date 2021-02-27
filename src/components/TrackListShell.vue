<template>
  <slot name="header" />
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
    <slot name="body" />
  </div>
</template>
<script></script>
<style lang="scss">
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
</style>
