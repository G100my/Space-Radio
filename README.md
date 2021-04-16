# Jukebox

[![hackmd-github-sync-badge](https://hackmd.io/KgDx3q1DSm6xyr6oBVDK0Q/badge)](https://hackmd.io/KgDx3q1DSm6xyr6oBVDK0Q)

###### tags: `Jukebox`

---

### 基於 Spotify 音樂串流服務的**區域性空間公共點歌台**。

#### 能讓同處同一個區域性空間的使用者透過**網頁**進行點插歌，並於特定 Spotify Premium account 所登入的設備使用**瀏覽器**播放音樂。

---

和 Spotify 原本所提供的*群組點唱單功能 Beta*雷同，
但有以下幾點重要差異，這也是這個 side project 想解決的問題：

|  |Jukebox|群組點唱單|
|-|-|-|
|人數上限| **無** | 目前 5 人|
|操作|避開誤觸、被直接切歌的風險|稍有操作不慎會立即反應給所有使用者|
|account level|只有負責播放的使用者需要 premium level|所有參與使用者都需要是 premium level 才能使用群組點唱單|
|適用情境|**多人共處共享空間**，多人在各自設備上點播音樂，由單一設備(區域性公共音響)播放音樂|**遠端**的三五好友一起聽同一份歌單，所有加入群組點唱單的設備都會播放音樂|
|*使用方式| 知道網址即可加入 | 需要由開啟群組點唱單的使用者發出邀請網址給其他使用者、或者掃描 Spotify code|
| |切換歌曲間隙插入留言語音廣播| - |
| |投票切歌制度| - |

---

### 使用條件:

需要有一個 Spotify Premium level 帳號作為 room host account，負責撥放音樂。
其他使用者使用自己的 Spotify account 登入後進行搜尋歌曲、點播歌曲等相關 Spotify 提供的 API 服務。

### 功能:

1. 點歌
1. 插歌 + 語音廣播留言
1. 搜尋歌曲
1. 使用者最近 50 首播放紀錄的快捷點/插播清單
1. 投票切歌
1. 調整音量
1. 創建共播音樂房間
1. 將正在播放的音樂加入最愛、加入指定的使用者私人播放清單
1. 作為 host 的使用者可以設定最小音量、投票切歌門檻人數

---

## v1 demo

![](https://i.imgur.com/rh3Iowq.png =1000x)

![](https://i.imgur.com/YdXO4pN.png =1000x)

![](https://i.imgur.com/7SzwwfS.png =350x)
![](https://i.imgur.com/7T0mFjJ.png =350x)
![](https://i.imgur.com/LMe8AgY.png =350x)


- 預定功能全部實現，多加入"使用者操作 Log"功能
- 為無 UX/UI、設計稿的手刻排版
- 手機版為左右滑動，切換"正在撥放/功能按鈕"與"待播清單"

---

## v2 導入 UI/UX、設計

- 導入 Tailwind CSS (原本使用 Sass 純手刻、無 UI component 框架)
- 按照 UI/UX 夥伴的設計稿重新建構版面樣式