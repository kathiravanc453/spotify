# Rhythmix - Modern Music Streaming App

Rhythmix is a fully-featured, dynamic music streaming application built with React, Vite, Node.js, and Capacitor. It offers a premium UI designed for both desktop and mobile, with intelligent music queueing, live synchronized lyrics, and massive dynamically curated playlists.

## ✨ Key Features

- **200+ Dynamic Songs per Folder**: Discover Folders (e.g., Kuthu, 90s Melodies, Lofi Chill) and Mood buttons dynamically fetch up to 240 search results in parallel, deduplicating them instantly into a massive playable queue.
- **Dynamic Stream Resolution**: Songs with encrypted streaming links are seamlessly decrypted on-the-fly when played, ensuring no broken tracks and a flawless listening experience.
- **Immersive Mobile UI**: PWA and Android Capacitor ready! Carefully tuned interface utilizing bottom safe areas, sticky footers, and a viewport-fitted layout that prevents clipping or scrolling when the lyrics are active.
- **Smart Lyrics Auto-Scrolling**: Lyrics sync in real-time with the track. The auto-scroller intelligently pauses whenever you manually scroll or touch the screen, automatically resuming 8 seconds later.
- **Daily Trending Charts**: The home screen automatically aggregates "Trending Hits", "New Arrivals", and customized Tamil playlists every day directly from live sources, guaranteeing fresh content on launch.
- **Cross-Platform Background Playback**: Supported natively via capacitor integrations and robust frontend state management.

## 🚀 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide React (Icons), Vite
- **Backend**: Node.js, Express, JioSaavn Unofficial API integration
- **Mobile**: Capacitor (Android/iOS integration)
- **Deployment**: Vercel/Render support out-of-the-box

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kathiravanc453/spotify.git
   cd spotify
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   cd backend
   node server.js
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

5. **Build for Android:**
   ```bash
   npm run build
   npx cap sync android
   ```

## 📱 Mobile App (Capacitor)
You can directly open `android/` directory in Android Studio and build your APK. The web application handles the padding and native safe-area insets seamlessly!

---
*Developed with a focus on modern aesthetic design and vast music discovery capabilities.*
