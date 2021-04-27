<template>
  <header :class="{ 'active-search': isSearchActive }">
    <Marquee />
    <nav>
      <!-- <AdditionDisplay
        v-if="mobileMode"
        v-show="additionDisplayToggler"
        :source="additionDisplaySource"
        @activeNoteDialog="activeNoteDialogHandler"
        @disactiveSearchStyle="isSearchActive = false"
      /> -->
      <SearchBar
        @triggerSearchStyle="isSearchActive = $event"
        @triggerAdditionDisplay="additionDisplayToggler = $event"
        @updateAdditionDisplaySource="additionDisplaySource = $event"
      />
      <h1>
        <img src="../assets/vinyl-record.png" alt="" />
        <p>{{ $store.getters.roomName }}</p>
      </h1>
      <ul>
        <li>
          <UserRecentPlayedButton
            @triggerAdditionDisplay="additionDisplayToggler = !additionDisplayToggler"
            @updateAdditionDisplaySource="additionDisplaySource = $event"
          />
        </li>
        <li class="user-name">
          <p>
            <!-- prettier-ignore -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
            <span>{{ $store.getters.userName }}</span>
          </p>
        </li>
      </ul>
    </nav>
  </header>
</template>
<script>
import SearchBar from '../../components/SearchBar.vue'
import Marquee from '../../components/Marquee.vue'
import UserRecentPlayedButton from '../../components/feature-buttons/UserRecentPlayedButton.vue'

export default {
  components: {
    SearchBar,
    Marquee,
    UserRecentPlayedButton,
  },
  data() {
    return {
      isSearchActive: false,
      additionDisplayToggler: false,
      additionDisplaySource: [],
    }
  },
}
</script>
<style lang="scss">
$icon-length: 35px;
header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  flex-direction: column-reverse;
  background-color: var(--primary-dark);
  @media (min-width: 768px) {
    left: auto;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    width: calc(100% - 400px);
    background-color: initial;
  }
}
nav {
  padding: 15px;
  display: flex;
  width: 100%;
  box-sizing: border-box;
  @media (min-width: 768px) {
    justify-content: flex-end;
    transition: flex 0.3s ease-in-out;
    flex: 0 0 0;
  }

  h1 {
    order: -1;
    display: flex;
    align-items: center;
    img {
      width: 30px;
      margin-right: 5px;
    }
    p {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    @media (min-width: 768px) {
      display: none;
      margin: 0;
    }
  }

  > ul {
    display: flex;
    font-size: 0;
    justify-content: flex-end;
    li {
      border: 2px solid var(--primary-highlight);
      border-radius: 4px;
    }
    .list-toggler {
      border: none;
      height: $icon-length;
      width: $icon-length;
      svg {
        height: 100%;
        width: 100%;
        vertical-align: bottom;
      }
    }
    .user-name {
      margin-left: 10px;
      font-size: 16px;
      height: $icon-length;
      display: flex;
      align-items: center;
      p {
        margin: 0 5px;
        white-space: nowrap;
      }
      svg {
        vertical-align: bottom;
        height: 20px;
        width: 20px;
      }
      span {
        display: inline-block;
        max-width: 55px;
        text-overflow: ellipsis;
        overflow: hidden;
        vertical-align: bottom;
        @media (min-width: 768px) {
          max-width: none;
        }
      }
    }
  }
}
</style>