# 📻 LAV PANDEY MUSIC HOUSE (2000s HQ RETRO PLAYER)

<div align="center">

```
   ____________________________________________________________________
  |  ________________________________________________________________  |
  | |  LAV PANDEY MUSIC HOUSE  ::  CYBER CAFE STATION #04 (128 KBPS) | |
  | |________________________________________________________________| |
  | |  [====]     [  SIDE A  ::  HIGH BIAS TYPE II  ]     [====]     | |
  | |   (O)================================================(O)       | |
  | |  /  |  \                                            /  |  \      | |
  | | (___|___)   [======== EQUALIZER: WINAMP ========]  (___|___)     | |
  | |________________________________________________________________| |
  |____________________________________________________________________|
```

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![YouTube API](https://img.shields.io/badge/YouTube_Player-API-FF0000?style=for-the-badge&logo=youtube&logoColor=white)

---

### 📼 *Step back into 2004 — The Cyber Cafe Era Audio Experience* 📼

**Lav Pandey Music House** is a nostalgic, interactive retro audio station inspired by early 2000s Indian Cyber Cafes, Winamp MP3 skins, cassette boomboxes, and CRT monitor scanlines.

</div>

---

## 🎨 Visual Identity & Theme Highlights

<div align="center">

| 🔴 Neon Cyan | 🟢 Cyber Emerald | 🟣 Yahoo Purple | 🟡 Amber Reel |
| :---: | :---: | :---: | :---: |
| `#06B6D4` | `#10B981` | `#A855F7` | `#F59E0B` |
| **High-Contrast CRT** | **System Status** | **Messenger UI** | **Cassette Reels** |

</div>

---

## ⚡ Key Features

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🎧 RETRO AUDIO ENGINE                                                  │
├────────────────────────────────────────────────────────────────────────┤
│ • YouTube IFrame Streamer & Live Playlist Importer (e.g. Honey Singh)  │
│ • Animated Spinning Cassette Tape Reels with Tape Counter & Dynamic EQ │
│ • Web Audio Synthesizer Fallback Beats                                 │
│ • Winamp Audio Equalizer Presets (Bass Boost, Techno, Vocal, Rock)     │
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ 💻 2000s CYBER CAFE INTERACTIVE TOOLS                                  │
├────────────────────────────────────────────────────────────────────────┤
│ • Nero Express CD Burner Modal (Create custom 700MB MP3 Mix CDs)       │
│ • Yahoo! Messenger Retro Chat Simulator with vintage sound effects    │
│ • CRT Scanline Monitor Filter Toggle (Key: C)                          │
│ • Mechanical Button Sound FX & Cassette Deck Clicks                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎶 Curated Playlists Included

- ⚡ **Yo Yo Honey Singh Hits**: *Brown Rang, Blue Eyes, Desi Kalakaar, Dope Shope, High Heels, Dheere Dheere, Love Dose*
- 💥 **Punjabi Rap & Underground**: *Amplifier, Satisfya, Modern Rap Classics*
- 📻 **Cyber Cafe 2000s Classics**: *Aadat, Tu Jaane Na, Zara Sa, Dil Chahta Hai, Woh Lamhe*
- 🌺 **Bhakti & Devotional**: *Shree Hanuman Chalisa, Achyutam Keshavam, Shiv Tandav*
- 🎤 **90s & 2000s Bollywood Golden Eras**: *Pehla Nasha, Dil To Pagal Hai, Tum Hi Ho*
- 📺 **Live YouTube URL Stream**: Paste any YouTube Video or Playlist link (`playlist?list=...`) to play directly inside the mini CRT display!

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :---: | :--- |
| `Space` | ⏯️ Play / Pause Track |
| `C` | 📺 Toggle CRT Monitor Scanlines Filter |
| `M` | 🔇 Mute / Unmute Volume |
| `KeyRight` | ⏭️ Next Track |
| `KeyLeft` | ⏮️ Previous Track |

---

## 📂 Project Architecture

```
/src
 ├── 📜 App.tsx                      # Main Application Entry & Global State
 ├── 📜 main.tsx                     # Vite Mount
 ├── 📜 index.css                    # Tailwind + CRT Scanlines & Cassette CSS
 ├── 📁 components/
 │    ├── 📻 Header.tsx              # Brand Banner & Cyber Cafe PC Status
 │    ├── ⚡ TickerBar.tsx            # Nostalgic Memories Rotating Ticker
 │    ├── 🗂️ CategorySidebar.tsx      # Playlist Categories & CAB-04 Widget
 │    ├── 🎶 SongListPanel.tsx       # Song Queue, Search & YouTube URL Importer
 │    ├── 📼 CassetteCenterpiece.tsx # Animated Cassette Deck & Spectrum Analyzer
 │    ├── 🎛️ WinampEqModal.tsx       # Winamp Graphic Equalizer
 │    ├── 💿 NeroCdBurnerModal.tsx   # CD Burner Interface (Custom MP3 CD Mix)
 │    ├── 💬 YahooChatModal.tsx      # Yahoo! Messenger Retro Chat Window
 │    └── 🎚️ GlassPlayer.tsx         # Fixed Player Bar & Mini CRT TV Video Screen
 ├── 📁 data/
 │    └── 🎵 songs.ts                # Curated Song Database & Categories
 └── 📁 utils/
      └── 🔊 soundEffects.ts         # Retro Beeps & Cassette Deck Mechanical FX
```

---

## 🚀 Quick Start & Deployment

```bash
# 1. Clone the repository
git clone https://github.com/mr7x00/LAV-PANDEY-MUSIC-HOUSE.git

# 2. Navigate to project folder
cd LAV-PANDEY-MUSIC-HOUSE

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev

# 5. Build for GitHub Pages deployment
npm run build
```

### 🌐 Deploying to GitHub Pages (`gh-pages`)

To deploy this project to GitHub Pages (e.g. `https://mr7x00.github.io/LAV-PANDEY-MUSIC-HOUSE/`):

1. **Vite Base Path**: `vite.config.ts` is configured with `base: './'` so relative asset paths work automatically on GitHub Pages subpaths.
2. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure base path for GitHub Pages"
   git push origin main
   ```
3. **Set up GitHub Pages**:
   - Go to your repository **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions** (or select **Deploy from a branch** and pick `gh-pages` / `dist` folder).

---

<div align="center">

### 📻 *Created with ❤️ for Nostalgia & Cyber Cafe Memories* 📻
**Lav Pandey Music House — Established 2004**

</div>
