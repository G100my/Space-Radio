# Space radio 空間廣播

**UI Designer:** [Echo](https://echowenchi.myportfolio.com/work)

**Developer:** [G100](/)

---

## 基於 Spotify 音樂串流服務的「**區域性空間公共點歌平台**」。

#### 讓同處同一個區域性空間的使用者透過**網頁**進行點/插歌，

並於指定 Spotify Premium account 所登入的設備使用**瀏覽器**播放音樂。

---

### Required:

需要有一個 Spotify Premium level 帳號作為 room host account，負責撥放音樂。

其他使用者則作為 customer，用自己的 Spotify account 登入後，
進行搜尋歌曲、點播歌曲等相關 Spotify 提供的 API 服務。
經由 Firebase 同步所有的點/插歌，
最後由 room host 的瀏覽器處理撥放、換歌、切歌等動作。
![space radio work flow](https://github.com/G100my/Space-Radio/blob/main/doc_Images/spaceradio-flow.jpg?raw=true)

### Feature:

1. 點歌
1. 插歌 + 語音留言廣播
1. 搜尋歌曲
1. 列出使用者歌單
   - 最近播放紀錄清單
   - 近一年最喜愛的歌曲清單
   - 近半年最喜愛的歌曲清單
   - 近一個月最喜愛的歌曲清單
   - 使用者播放清單
1. 投票切歌
1. 調整公播音量
1. 創建共播音樂房間
1. 將正在播放的音樂**加入最愛**、**加入指定的使用者私人播放清單**
1. 房間操作紀錄
1. 遠端同步，建立自己的 web player，與 Host player 同步撥放音樂 (未完善)
1. 支援 RWD
1. TTS 插歌留言語音廣播

## How to use

1. 點選 "Create Room"，使用 Spotify Oauth 登入。
1. 設定基本設定、創建新的房間，該 Spotify 使用者即為 **Host**。
1. 按下撥放鍵，會從該 Spotify 帳號直接撥放上一次播放的音樂。
1. 邀請朋友在 "Enter Room" 頁面搜尋 剛剛創建的房間名稱，即可點歌播歌。

`Vote for Skip`: 投票人數若超過建立房間時所設定的 "**Skip Song threshold**"，會開始倒數 10 秒，進行切歌。

⬆️: **↑** 鍵為插歌，插歌目前預設會有中文語音廣播，可以留言，語音撥放會更新文字到上方跑馬燈。

➕: **+** 鍵為一般點歌，點歌照時間順序排列。

❤️: 功能等同 spotify 的 "like song" 功能。

`Local Player Toggle`: 當使用者帳號為 **Premium**，且不是 **Host**使用者時，會出現在 Personal side drawer 裡。開啟後會經由瀏覽器產生 spotify player，*基本上*音樂會與所處房間同步撥放。

:::info

- 不是從 Space radio 加入的音樂並不會出現在 Space radio 的 list 內。
- 插歌點歌實際上是使用 spotify 的 "Add to queue" api，
  所以不會影響到原本已經存在裝置播放清單的序列歌曲，
  仍然可以使用 spotify 原本的 app 操作點歌、換歌單、撥放/暫停等功能，
  但必須由 **瀏覽器** 執行撥放才能讓 Space radio 的清單有效運作。
- 會刪除超過 30 天未使用的房間，屆時請重新創立房間。

:::

---

### Dependency

#### v1

- Vue3, Vite, Vuex, Vue Router
- SpotifyApi, Firebase - Realtime database
- Sass

#### v2

- Vue3, Vite, Vuex, Vue Router
- SpotifyApi, Firebase - Realtime database
- Tailwind CSS, HeadlessUI

## V1

UI Design by G100

![v1 hall](https://github.com/G100my/Space-Radio/blob/main/doc_Images/v1hall.png?raw=true)

![v1 room](https://github.com/G100my/Space-Radio/blob/main/doc_Images/v1room.png?raw=true)

![v1 main](https://github.com/G100my/Space-Radio/blob/main/doc_Images/v1main.png?raw=true)

![v1 list](https://github.com/G100my/Space-Radio/blob/main/doc_Images/v1list.png?raw=true)

---

## v2

UI Design by [Echo](https://echowenchi.myportfolio.com/work)

![v2 hall](https://github.com/G100my/Space-Radio/blob/main/doc_Images/v2hall.jpg?raw=true)

![v2 room](https://github.com/G100my/Space-Radio/blob/main/doc_Images/v2room.jpg?raw=true)

![v2 main](https://github.com/G100my/Space-Radio/blob/main/doc_Images/v2main.jpg?raw=true)

![v2 list](https://github.com/G100my/Space-Radio/blob/main/doc_Images/v2list.jpg?raw=true)
