# ICRT 字幕播放器 (校園明亮風) 實作計畫

這個計畫將按照您的需求「打掉重練」，在 `ICRT` 資料夾建立一個全新的、具備自動對齊高亮與檔案掃描功能的獨立 [index.html](file:///d:/jackblack/00%E8%B3%87%E8%A8%8A%E7%B5%84/10_python/00_antigravity/my-website/index.html)。

## 系統架構：單檔 React + Tailwind + Shadcn 美學
為了符合您「只要點擊 ICRT 內的 index.html 檔案」這個純靜態網頁的需求，同時又要達到 `shadcn-ui` 的精美介面與互動性：
*   **前端框架**: 使用 React (透過 Babel CDN 即時編譯)，讓我們能寫出現代化的 UI 元件。
*   **介面風格 (shadcn-ui)**: 引入 Tailwind CSS CDN，並在程式碼中手刻對應的 shadcn 元件結構 (如 Card, Button, Input 等)，並套用「校園明亮風」(天藍色系、白底、圓角陰影)。
*   **圖示庫**: 使用 Lucide React 圖示，增加介面質感。
*   **零後端部署**: 所有程式碼集中於 [index.html](file:///d:/jackblack/00%E8%B3%87%E8%A8%8A%E7%B5%84/10_python/00_antigravity/my-website/index.html)，上傳到學校伺服器即可運作。

## 核心功能實作

### 1. 自動掃描音檔與字幕檔
瀏覽器在純靜態網頁中無法直接得知資料夾有哪些檔案，我們將採用以下混合作法：
1. **目錄解析 (Directory Listing)**：程式啟動時會嘗試 [fetch('./')](file:///d:/jackblack/00%E8%B3%87%E8%A8%8A%E7%B5%84/10_python/00_antigravity/my-website/icrt.html#178-203) 讀取當前資料夾，如果學校伺服器有開啟目錄瀏覽權限，JS 會自動解析出所有的 `.mp3` 和 `.txt`，並列在側邊欄播放清單中。
2. **自動推測對應檔名**：當使用者點選 `1.mp3` 時，系統會自動尋找 `1.txt` 作為對應的字幕檔。
3. **防呆輸入 (Fallback)**：萬一伺服器因安全設定阻擋目錄讀取 (回傳 403)，我們會在畫面上優雅地提供下拉選單或直接輸入檔名的介面，確保系統在任何環境都不會壞掉。

### 2. 動態高亮字幕 (KTV / Spotify 歌詞效果)
*   讀取 `.txt` 檔案，因為裡面實際上是 `.sbv` 格式 (例如 `0:00:17.040,0:00:21.440`)。
*   寫入正則表達式解析時間軸。
*   在 React 中監聽 `audio` 的 `timeupdate` 事件。
*   使用 `framer-motion` 或 Tailwind 的 `transition`，讓當下那一句亮起主要顏色 (Primary Color)、稍微放大，並且讓捲軸平滑地置中跟隨。

## 預定建立檔案
*   **[NEW] `d:\jackblack\00資訊組\10_python\00_antigravity\my-website\ICRT\index.html`**

## 驗證計畫
1.  使用者將 [index.html](file:///d:/jackblack/00%E8%B3%87%E8%A8%8A%E7%B5%84/10_python/00_antigravity/my-website/index.html)、`1.mp3`、`1.txt` 放在同一個資料夾，並上傳至學校伺服器。
2.  開啟網頁後，確認 `shadcn-ui` 風格的校園明亮介面是否正常顯示。
3.  測試音檔播放時，`.txt` 內的 SBV 時間軸是否如 KTV 般自動捲動與高亮對齊。
