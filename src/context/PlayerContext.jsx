import { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { splitArtists } from '../utils/cleanTitle';
import { db } from '../firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const PlayerContext = createContext(null);

export function PlayerProvider({ children, user }) {

  const [currentSong, setCurrentSong]   = useState(null);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [progress, setProgress]         = useState(0);
  const [duration, setDuration]         = useState(0);
  const [volume, setVolume]             = useState(0.8);
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try { 
      const raw = JSON.parse(localStorage.getItem('rhythmix_recently_played')) || [];
      // Strip src from loaded songs to prevent expired URLs from crashing the app
      return raw.map(s => {
        const clean = { ...s };
        delete clean.src;
        return clean;
      });
    } catch { return []; }
  });
  const skipCountRef = useRef(0);
  const [loading, setLoading]           = useState(false);
  const [favorites, setFavorites]       = useState([]);
  const loadedRef                       = useRef(true);
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      return hash || 'home';
    }
    return 'home';
  });

  // Global Preferences
  const [musicLanguages, setMusicLanguages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_music_langs')) || ['English', 'Hindi']; } catch { return ['English', 'Hindi']; }
  });
  const [appLanguage, setAppLanguage] = useState(() => {
    try { return localStorage.getItem('rhythmix_app_lang') || 'en'; } catch { return 'en'; }
  });
  const [reduceAnimations, setReduceAnimations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_reduce_anim')) || false; } catch { return false; }
  });
  const [infiniteDj, setInfiniteDj] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_infinite_dj')) || false; } catch { return false; }
  });


  // ─── Extended Settings State ──────────────────────────────────────────────
  const [gaplessPlayback, setGaplessPlayback] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_gapless')) ?? true; } catch { return true; }
  });
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_autoplay')) ?? true; } catch { return true; }
  });
  const [monoAudio, setMonoAudio] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_mono')) ?? false; } catch { return false; }
  });
  const [deviceBroadcast, setDeviceBroadcast] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_broadcast')) ?? false; } catch { return false; }
  });
  const [pictureInPicture, setPictureInPicture] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_pip')) ?? false; } catch { return false; }
  });
  
  const [dataSaverMode, setDataSaverMode] = useState(() => {
    try { return localStorage.getItem('rhythmix_data_saver') || 'Always off'; } catch { return 'Always off'; }
  });
  const [cellularDownloads, setCellularDownloads] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_cell_dl')) ?? false; } catch { return false; }
  });
  const [audioOnlyDownloads, setAudioOnlyDownloads] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_audio_dl')) ?? false; } catch { return false; }
  });
  const [audioOnlyStreaming, setAudioOnlyStreaming] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_audio_stream')) ?? false; } catch { return false; }
  });

  const [wifiQuality, setWifiQuality] = useState(() => {
    try { return localStorage.getItem('rhythmix_wifi_q') || 'Automatic'; } catch { return 'Automatic'; }
  });
  const [cellularQuality, setCellularQuality] = useState(() => {
    try { return localStorage.getItem('rhythmix_cell_q') || 'Automatic'; } catch { return 'Automatic'; }
  });
  const [autoAdjustQuality, setAutoAdjustQuality] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_auto_adjust')) ?? true; } catch { return true; }
  });
  const [downloadQuality, setDownloadQuality] = useState(() => {
    try { return localStorage.getItem('rhythmix_dl_q') || 'Normal'; } catch { return 'Normal'; }
  });

  // Effects to persist to localStorage instantly on change
  useEffect(() => { try { localStorage.setItem('rhythmix_gapless', JSON.stringify(gaplessPlayback)); } catch(e){} }, [gaplessPlayback]);
  useEffect(() => { try { localStorage.setItem('rhythmix_autoplay', JSON.stringify(autoplayEnabled)); } catch(e){} }, [autoplayEnabled]);
  useEffect(() => { try { localStorage.setItem('rhythmix_mono', JSON.stringify(monoAudio)); } catch(e){} }, [monoAudio]);
  useEffect(() => { try { localStorage.setItem('rhythmix_broadcast', JSON.stringify(deviceBroadcast)); } catch(e){} }, [deviceBroadcast]);
  useEffect(() => { try { localStorage.setItem('rhythmix_pip', JSON.stringify(pictureInPicture)); } catch(e){} }, [pictureInPicture]);
  useEffect(() => { try { localStorage.setItem('rhythmix_data_saver', dataSaverMode); } catch(e){} }, [dataSaverMode]);
  useEffect(() => { try { localStorage.setItem('rhythmix_cell_dl', JSON.stringify(cellularDownloads)); } catch(e){} }, [cellularDownloads]);
  useEffect(() => { try { localStorage.setItem('rhythmix_audio_dl', JSON.stringify(audioOnlyDownloads)); } catch(e){} }, [audioOnlyDownloads]);
  useEffect(() => { try { localStorage.setItem('rhythmix_audio_stream', JSON.stringify(audioOnlyStreaming)); } catch(e){} }, [audioOnlyStreaming]);
  useEffect(() => { try { localStorage.setItem('rhythmix_wifi_q', wifiQuality); } catch(e){} }, [wifiQuality]);
  useEffect(() => { try { localStorage.setItem('rhythmix_cell_q', cellularQuality); } catch(e){} }, [cellularQuality]);
  useEffect(() => { try { localStorage.setItem('rhythmix_auto_adjust', JSON.stringify(autoAdjustQuality)); } catch(e){} }, [autoAdjustQuality]);
  useEffect(() => { try { localStorage.setItem('rhythmix_dl_q', downloadQuality); } catch(e){} }, [downloadQuality]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('rhythmix_infinite_dj', JSON.stringify(infiniteDj)); } catch (e) {}
    }
  }, [infiniteDj]);

  // Apply reduced animations class globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (reduceAnimations) {
        document.body.classList.add('reduce-animations');
      } else {
        document.body.classList.remove('reduce-animations');
      }
      try { localStorage.setItem('rhythmix_reduce_anim', JSON.stringify(reduceAnimations)); } catch (e) {}
    }
  }, [reduceAnimations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('rhythmix_music_langs', JSON.stringify(musicLanguages)); } catch (e) {}
    }
  }, [musicLanguages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('rhythmix_app_lang', appLanguage); } catch (e) {}
    }
  }, [appLanguage]);

  // Sync activeSection with browser history to enable mobile native back button
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentHash = window.location.hash.replace('#', '') || 'home';
      if (currentHash !== activeSection) {
        window.history.pushState({ section: activeSection }, '', `#${activeSection}`);
      }
    }
  }, [activeSection]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = (event) => {
      if (event.state && event.state.section) {
        setActiveSection(event.state.section);
      } else {
        const hash = window.location.hash.replace('#', '');
        setActiveSection(hash || 'home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [activeArtist, setActiveArtist] = useState(null);
  const [activeActor, setActiveActor] = useState(null);
  const [saavnResults, setSaavnResults] = useState([]);
  const [saavnLoading, setSaavnLoading] = useState(false);
  const [saavnRadioPool, setSaavnRadioPool] = useState([]);
  const [isContextualQueue, setIsContextualQueue] = useState(false);

  // ─── Custom User Queue ──────────────────────────────────────────────────
  const [customQueue, setCustomQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_custom_queue')) || []; } catch { return []; }
  });

  const playNextSong = useCallback((song) => {
    setCustomQueue(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      const next = [song, ...filtered];
      try { localStorage.setItem('rhythmix_custom_queue', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }, []);

  const addToQueue = useCallback((song) => {
    setCustomQueue(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      const next = [...filtered, song];
      try { localStorage.setItem('rhythmix_custom_queue', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setCustomQueue([]);
    try { localStorage.setItem('rhythmix_custom_queue', JSON.stringify([])); } catch (e) {}
  }, []);

  // Lyrics State
  const [lyricsData, setLyricsData] = useState([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState(null);

  const [saavnHomeData, setSaavnHomeData] = useState({ trending: [], playlists: [], albums: [] });
  const [saavnHomeLoading, setSaavnHomeLoading] = useState(true);
  const [sleepTimer, setSleepTimer]     = useState(null); // minutes remaining
  const [playCounts, setPlayCounts]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_playcounts') || '{}') || {}; } catch { return {}; }
  });
  const [albumCovers, setAlbumCovers]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_album_covers_v2') || '{}') || {}; } catch { return {}; }
  });

  const [isShuffle, setIsShuffle] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_shuffle') || 'false'); } catch { return false; }
  });
  const [repeatMode, setRepeatMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_repeat')) || 'off'; } catch { return 'off'; }
  });
  
  // Custom Playlists State
  const [playlists, setPlaylists] = useState([]);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [songForPlaylist, setSongForPlaylist] = useState(null);

  // ─── FIRESTORE REAL-TIME SYNC ──────────────────────────────────────────────
  const isCloudSyncing = useRef(false);

  useEffect(() => {
    if (!user || !db) return;

    // 1. Initial Migration / Fetch
    const syncData = async () => {
      try {
        const userRef = doc(db, 'userData', user.uid);
        const snap = await getDoc(userRef);
        
        if (!snap.exists()) {
          // Migrate local data to cloud
          const localData = {
            favorites,
            playlists,
            recentlyPlayed,
            musicLanguages,
            appLanguage,
            
            reduceAnimations,
            infiniteDj,
            customQueue,
            gaplessPlayback,
            autoplayEnabled,
            monoAudio,
            deviceBroadcast,
            pictureInPicture,
            dataSaverMode,
            cellularDownloads,
            audioOnlyDownloads,
            audioOnlyStreaming,
            wifiQuality,
            cellularQuality,
            autoAdjustQuality,
            downloadQuality

          };
          await setDoc(userRef, localData, { merge: true });
        } else {
          // Load from cloud (only on first mount)
          isCloudSyncing.current = true;
          const data = snap.data();
          if (data.favorites !== undefined) setFavorites(data.favorites);
          if (data.playlists !== undefined) setPlaylists(data.playlists);
          if (data.recentlyPlayed !== undefined) setRecentlyPlayed(data.recentlyPlayed);
          if (data.musicLanguages !== undefined) setMusicLanguages(data.musicLanguages);
          if (data.appLanguage !== undefined) setAppLanguage(data.appLanguage);
          if (data.reduceAnimations !== undefined) setReduceAnimations(data.reduceAnimations);
          if (data.infiniteDj !== undefined) setInfiniteDj(data.infiniteDj);
          if (data.customQueue !== undefined) setCustomQueue(data.customQueue);
          
          if (data.gaplessPlayback !== undefined) setGaplessPlayback(data.gaplessPlayback);
          if (data.autoplayEnabled !== undefined) setAutoplayEnabled(data.autoplayEnabled);
          if (data.monoAudio !== undefined) setMonoAudio(data.monoAudio);
          if (data.deviceBroadcast !== undefined) setDeviceBroadcast(data.deviceBroadcast);
          if (data.pictureInPicture !== undefined) setPictureInPicture(data.pictureInPicture);
          if (data.dataSaverMode !== undefined) setDataSaverMode(data.dataSaverMode);
          if (data.cellularDownloads !== undefined) setCellularDownloads(data.cellularDownloads);
          if (data.audioOnlyDownloads !== undefined) setAudioOnlyDownloads(data.audioOnlyDownloads);
          if (data.audioOnlyStreaming !== undefined) setAudioOnlyStreaming(data.audioOnlyStreaming);
          if (data.wifiQuality !== undefined) setWifiQuality(data.wifiQuality);
          if (data.cellularQuality !== undefined) setCellularQuality(data.cellularQuality);
          if (data.autoAdjustQuality !== undefined) setAutoAdjustQuality(data.autoAdjustQuality);
          if (data.downloadQuality !== undefined) setDownloadQuality(data.downloadQuality);
          
          // Re-sync local storage so offline mode works next time
          try {
            if (data.favorites) localStorage.setItem(`rhythmix_favorites_${user.email}`, JSON.stringify(data.favorites));
            if (data.playlists) localStorage.setItem(`rhythmix_playlists_${user.email}`, JSON.stringify(data.playlists));
            if (data.recentlyPlayed) localStorage.setItem('rhythmix_recently_played', JSON.stringify(data.recentlyPlayed));
            if (data.musicLanguages) localStorage.setItem('rhythmix_music_langs', JSON.stringify(data.musicLanguages));
            if (data.appLanguage) localStorage.setItem('rhythmix_app_lang', data.appLanguage);
            if (data.reduceAnimations) localStorage.setItem('rhythmix_reduce_anim', JSON.stringify(data.reduceAnimations));
            if (data.infiniteDj) localStorage.setItem('rhythmix_infinite_dj', JSON.stringify(data.infiniteDj));
            if (data.customQueue) localStorage.setItem('rhythmix_custom_queue', JSON.stringify(data.customQueue));
          } catch (e) {}
          
          setTimeout(() => { isCloudSyncing.current = false; }, 1000); // Debounce write-backs
        }
      } catch (err) {
        console.error("Firestore sync error:", err);
      }
    };
    
    syncData();
    
    // 2. Real-time Listener
    const unsubscribe = onSnapshot(doc(db, 'userData', user.uid), (docSnap) => {
      if (docSnap.exists() && !isCloudSyncing.current) {
        isCloudSyncing.current = true;
        const data = docSnap.data();
        if (data.favorites) setFavorites(data.favorites);
        if (data.playlists) setPlaylists(data.playlists);
        if (data.recentlyPlayed) setRecentlyPlayed(data.recentlyPlayed);
        if (data.musicLanguages) setMusicLanguages(data.musicLanguages);
        if (data.appLanguage) setAppLanguage(data.appLanguage);
        if (data.reduceAnimations) setReduceAnimations(data.reduceAnimations);
        if (data.infiniteDj) setInfiniteDj(data.infiniteDj);
        if (data.customQueue) setCustomQueue(data.customQueue);
        
        // Save to local storage
        try {
          if (data.favorites) localStorage.setItem(`rhythmix_favorites_${user.email}`, JSON.stringify(data.favorites));
          if (data.playlists) localStorage.setItem(`rhythmix_playlists_${user.email}`, JSON.stringify(data.playlists));
          if (data.recentlyPlayed) localStorage.setItem('rhythmix_recently_played', JSON.stringify(data.recentlyPlayed));
        } catch(e) {}
        
        setTimeout(() => { isCloudSyncing.current = false; }, 1000);
      }
    });

    return () => unsubscribe();
  }, [user]); // We only trigger on user change to load data

  // 3. Write changes to Firestore whenever state changes locally
  useEffect(() => {
    if (!user || !db || isCloudSyncing.current) return;
    
    const timeout = setTimeout(() => {
      setDoc(doc(db, 'userData', user.uid), {
        favorites,
        playlists,
        recentlyPlayed,
        musicLanguages,
        appLanguage,
        
        reduceAnimations,
        infiniteDj,
        customQueue,
        gaplessPlayback,
        autoplayEnabled,
        monoAudio,
        deviceBroadcast,
        pictureInPicture,
        dataSaverMode,
        cellularDownloads,
        audioOnlyDownloads,
        audioOnlyStreaming,
        wifiQuality,
        cellularQuality,
        autoAdjustQuality,
        downloadQuality
      }, { merge: true }).catch(err => console.error("Firestore write error:", err));
    }, 1000); // Debounce writes
    
    return () => clearTimeout(timeout);
  }, [favorites, playlists, recentlyPlayed, musicLanguages, appLanguage, reduceAnimations, infiniteDj, customQueue, gaplessPlayback, autoplayEnabled, monoAudio, deviceBroadcast, pictureInPicture, dataSaverMode, cellularDownloads, audioOnlyDownloads, audioOnlyStreaming, wifiQuality, cellularQuality, autoAdjustQuality, downloadQuality, user]);


  const audioRef = useRef(null);
  const streamUrlsRef = useRef({});

  if (!audioRef.current && typeof window !== 'undefined') {
    const a = new Audio();
    a.autoplay = true; // CRITICAL for background auto-advance on mobile!
    a.playsInline = true;
    a.preload = 'auto';
    audioRef.current = a;
  }

  // ─── Screen Wake Lock API ─────────────────────────────────────────────────
  const wakeLockRef = useRef(null);
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    };
    const releaseWakeLock = () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };

    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Re-acquire wake lock if page becomes visible while playing
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  const sleepTimerRef                   = useRef(null);

  // ─── Persist shuffle / repeat ────────────────────────────────────────────
  useEffect(() => { try { localStorage.setItem('rhythmix_shuffle', JSON.stringify(isShuffle)); } catch (e) {} }, [isShuffle]);
  useEffect(() => { try { localStorage.setItem('rhythmix_repeat',  JSON.stringify(repeatMode)); } catch (e) {} }, [repeatMode]);

  // ─── Favorites ───────────────────────────────────────────────────────────
  useEffect(() => {
    const loadFavs = () => {
      try {
        const session   = localStorage.getItem('rhythmix_session');
        const userEmail = session ? JSON.parse(session)?.email : 'default';
        const saved     = localStorage.getItem(`rhythmix_favorites_${userEmail}`);
        setFavorites(saved ? (JSON.parse(saved) || []) : []);
      } catch { setFavorites([]); }
    };
    loadFavs();
    window.addEventListener('storage', loadFavs);
    return () => window.removeEventListener('storage', loadFavs);
  }, []);

  const toggleLike = useCallback((songId) => {
    try {
      const session   = localStorage.getItem('rhythmix_session');
      const userEmail = session ? JSON.parse(session)?.email : 'default';
      const key       = `rhythmix_favorites_${userEmail}`;
      setFavorites(prev => {
        const next = prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId];
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    } catch (e) { console.error(e); }
  }, []);

  // ─── Playlists ───────────────────────────────────────────────────────────
  const getPlaylistsKey = useCallback(() => {
    const session = localStorage.getItem('rhythmix_session');
    const userEmail = session ? JSON.parse(session)?.email : 'default';
    return `rhythmix_playlists_${userEmail}`;
  }, []);

  const fetchPlaylists = useCallback(() => {
    try {
      const saved = localStorage.getItem(getPlaylistsKey());
      if (saved) {
        setPlaylists(JSON.parse(saved));
      } else {
        setPlaylists([]);
      }
    } catch (e) {
      console.error('Failed to fetch playlists from localStorage:', e);
      setPlaylists([]);
    }
  }, [getPlaylistsKey]);

  useEffect(() => {
    fetchPlaylists();
    const handleStorage = () => fetchPlaylists();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [fetchPlaylists]);

  const savePlaylists = useCallback((newPlaylists) => {
    try {
      localStorage.setItem(getPlaylistsKey(), JSON.stringify(newPlaylists));
      setPlaylists(newPlaylists);
    } catch (e) {
      console.error('Failed to save playlists to localStorage:', e);
    }
  }, [getPlaylistsKey]);

  const createPlaylist = useCallback((name) => {
    if (!name || name.trim() === '') return;
    const newPlaylist = {
      id: Date.now().toString(),
      name: name.trim(),
      songs: []
    };
    savePlaylists([...playlists, newPlaylist]);
  }, [playlists, savePlaylists]);

  const deletePlaylist = useCallback((playlistId) => {
    const updated = playlists.filter(p => p.id !== playlistId);
    savePlaylists(updated);
  }, [playlists, savePlaylists]);

  const addSongToPlaylist = useCallback((playlistId, song) => {
    savePlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        if (!p.songs.some(s => s.id === song.id)) {
          return { ...p, songs: [...p.songs, song] };
        }
      }
      return p;
    }));
  }, [playlists, savePlaylists]);

  const removeSongFromPlaylist = useCallback((playlistId, songId) => {
    savePlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== songId) };
      }
      return p;
    }));
  }, [playlists, savePlaylists]);

  const openPlaylistModal = useCallback((song) => {
    if (!song) return;
    setSongForPlaylist(song);
    setIsPlaylistModalOpen(true);
  }, []);

  const closePlaylistModal = useCallback(() => {
    setIsPlaylistModalOpen(false);
    setTimeout(() => setSongForPlaylist(null), 300); // Wait for transition
  }, []);

  // ─── GLOBAL SAAVN SEARCH ──────────────────────────────────────────────────
  const searchSaavnGlobal = async (query, shuffleFull = false) => {
    if (!query || query.trim() === '') {
      setSaavnResults([]);
      return;
    }
    setSaavnLoading(true);
    try {
      const res = await fetch(`/api/saavn/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        if (shuffleFull) {
          const shuffled = data.sort(() => 0.5 - Math.random());
          setSaavnResults(shuffled);
        } else {
          setSaavnResults(data);
        }
      } else {
        setSaavnResults([]);
      }
    } catch (e) {
      console.error('Saavn Search Error:', e);
      setSaavnResults([]);
    } finally {
      setSaavnLoading(false);
    }
  };

  // ─── GLOBAL SAAVN HOME LAUNCH DATA ────────────────────────────────────────
  const fetchSaavnHome = useCallback(async () => {
    setSaavnHomeLoading(true);
    try {
      const langQuery = musicLanguages.map(l => l.toLowerCase()).join(',');
      const res = await fetch(`/api/saavn/home?languages=${langQuery}`);
      const data = await res.json();
      if (data && data.trending) {
        setSaavnHomeData(data);
      }
    } catch (e) {
      console.error('Saavn Home Error:', e);
    } finally {
      setSaavnHomeLoading(false);
    }
  }, [musicLanguages]);

  useEffect(() => {
    fetchSaavnHome();
  }, [fetchSaavnHome]);

  // ─── Play count tracking ──────────────────────────────────────────────────
  const incrementPlayCount = useCallback((songId) => {
    setPlayCounts(prev => {
      const updated = { ...prev, [songId]: (prev[songId] || 0) + 1 };
      localStorage.setItem('rhythmix_playcounts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ─── Global Song Pool (replaces old local allSongs) ─────────────────────
  const allSongs = useMemo(() => {
    const pool = new Map();
    
    if (saavnHomeData?.trending) {
      saavnHomeData.trending.forEach(item => {
        if (item.type === 'song') {
          pool.set(item.id, { ...item, cover: item.image || item.cover, artist: item.subtitle || item.artist });
        }
      });
    }
    
    if (saavnResults) {
      saavnResults.forEach(item => {
        if (item.type === 'song') {
          pool.set(item.id, { ...item, cover: item.image || item.cover, artist: item.subtitle || item.artist });
        }
      });
    }
    
    if (saavnRadioPool) {
      saavnRadioPool.forEach(item => {
        pool.set(item.id, { ...item, cover: item.image || item.cover, artist: item.subtitle || item.artist });
      });
    }
    
    recentlyPlayed.forEach(song => {
      pool.set(song.id, song);
    });

    customQueue.forEach(song => {
      pool.set(song.id, song);
    });
    
    return Array.from(pool.values());
  }, [saavnHomeData, saavnResults, saavnRadioPool, recentlyPlayed, customQueue]);

  // ─── Fetch Lyrics ────────────────────────────────────────────────────────
  const cleanTitle = (title) => {
    if (!title) return '';
    return title.replace(/\[.*?\]|\(.*?\)|\|.*/g, '').replace(/video|audio|lyric|remix|edit/gi, '').trim();
  };

  useEffect(() => {
    if (!currentSong) return;
    let isMounted = true;
    
    const fetchLyrics = async () => {
      setLyricsLoading(true);
      setLyricsError(null);
      setLyricsData([]);
      try {
        const title = encodeURIComponent(cleanTitle(currentSong.title));
        const artist = encodeURIComponent(currentSong.artist?.split(',')[0] || '');
        const res = await fetch(`https://lrclib.net/api/search?track_name=${title}&artist_name=${artist}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        if (isMounted) {
          const syncedResult = data.find(item => item.syncedLyrics);
          if (syncedResult && syncedResult.syncedLyrics) {
            const lines = syncedResult.syncedLyrics.split('\n');
            const parsed = lines.map(line => {
              const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
              if (match) {
                const mins = parseInt(match[1]);
                const secs = parseInt(match[2]);
                const ms = parseInt(match[3]);
                const time = mins * 60 + secs + (ms / (match[3].length === 3 ? 1000 : 100));
                return { time, text: match[4].trim() };
              }
              return null;
            }).filter(item => item && item.text);
            setLyricsData(parsed);
          } else {
            setLyricsError('No synchronized lyrics found.');
          }
        }
      } catch (e) {
        if (isMounted) setLyricsError('Failed to load lyrics.');
      } finally {
        if (isMounted) setLyricsLoading(false);
      }
    };

    const timeout = setTimeout(fetchLyrics, 50);
    return () => { isMounted = false; clearTimeout(timeout); };
  }, [currentSong]);

  // ─── Play song ────────────────────────────────────────────────────────────
  const playSong = useCallback(async (song, options = false) => {
    if (!user) {
      setActiveSection('login');
      return;
    }

    let keepQueue = false;
    let initialQueue = null;

    if (typeof options === 'boolean') {
      keepQueue = options;
    } else if (options && typeof options === 'object') {
      keepQueue = !!options.keepQueue;
      initialQueue = options.initialQueue;
    }

    setLoading(true);
    let resolvedSong = { ...song };

    // Inject prefetched URL if available (CRITICAL for background playback on mobile)
    const cached = streamUrlsRef.current[resolvedSong.id];
    if (!resolvedSong.src && cached) {
      if (cached.url && cached.url !== 'fetching' && cached.url !== 'failed') {
        const ageHours = (Date.now() - cached.timestamp) / (1000 * 60 * 60);
        if (ageHours < 6) { // Cache expires after 6 hours
          resolvedSong.src = cached.url;
        } else {
          delete streamUrlsRef.current[resolvedSong.id]; // Expired
        }
      }
    }

    // Resolve media stream URL (src) if missing (e.g. from trending list or sidebar)
    if (!resolvedSong.src) {
      try {
        const cleanId = resolvedSong.id.replace('saavn_', '');
        const res = await fetch(`/api/saavn/song/${cleanId}`);
        if (res.ok) {
          const detail = await res.json();
          resolvedSong = { ...resolvedSong, ...detail };
        }
      } catch (err) {
        console.error('Failed to resolve song src on the fly:', err);
      }
    }

    if (!resolvedSong.src) {
      console.error('No playable stream found for song:', resolvedSong);
      setLoading(false);
      
      // Auto-skip to the next song to prevent playback from silently stalling during infinite DJ
      if (keepQueue) {
        setTimeout(() => {
          skipCountRef.current += 1;
          if (playNextRef.current) playNextRef.current();
        }, 1500);
      }
      return;
    }

    const audio = audioRef.current;
    if (currentSong?.id === resolvedSong.id) {
      if (isPlaying) { audio.pause(); setIsPlaying(false); }
      else           { audio.play()?.catch(() => {});  setIsPlaying(true);  }
      setLoading(false);
      return;
    }

    audio.src = resolvedSong.src;
    audio.play()?.catch((err) => {
      console.error('Audio playback failed:', err);
    });

    setCurrentSong(resolvedSong);
    setIsPlaying(true);
    setLoading(false);
    incrementPlayCount(resolvedSong.id);
    
    // Auto-navigate to Now Playing screen as requested by user
    setActiveSection('now-playing');

    // Handle Custom Queue based on initialQueue or keepQueue
    if (initialQueue && Array.isArray(initialQueue)) {
      setIsContextualQueue(true);
      const idx = initialQueue.findIndex(s => s.id === resolvedSong.id || s.id === song.id);
      if (idx !== -1) {
        const nextQueue = initialQueue.slice(idx + 1);
        setCustomQueue(nextQueue);
        try { localStorage.setItem('rhythmix_custom_queue', JSON.stringify(nextQueue)); } catch (e) {}
      } else {
        setCustomQueue([]);
        try { localStorage.setItem('rhythmix_custom_queue', JSON.stringify([])); } catch (e) {}
      }
    } else if (!keepQueue) {
      // Clear custom queue if playing a single track from outside
      setIsContextualQueue(false);
      setCustomQueue([]);
      try { localStorage.setItem('rhythmix_custom_queue', JSON.stringify([])); } catch (e) {}
    } else {
      // Keep queue, just remove the playing song from custom queue if it exists there
      setCustomQueue(prev => {
        const next = prev.filter(s => s.id !== resolvedSong.id && s.id !== song.id);
        try { localStorage.setItem('rhythmix_custom_queue', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    }

    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== resolvedSong.id && s.id !== song.id);
      const cleanSong = { ...resolvedSong };
      delete cleanSong.src; // CRITICAL: NEVER store src in local storage as it expires
      const next = [cleanSong, ...filtered].slice(0, 100);
      try { localStorage.setItem('rhythmix_recently_played', JSON.stringify(next)); } catch (e) {}
      return next;
    });

    // Smart Radio Engine: Fetch related songs silently in the background
    const rawArtist = resolvedSong.artist && resolvedSong.artist !== 'Unknown Artist' ? resolvedSong.artist.split(',')[0] : '';
    const artistQuery = rawArtist ? `${rawArtist} Tamil` : '';
    const moodQuery = `${resolvedSong.mood || 'hits'} Tamil`;
    const randomKeywords = ['latest', 'trending', 'hits', 'viral', 'bgm', 'melody', 'kuthu', 'love', 'dance'];
    const randomQuery = `${randomKeywords[Math.floor(Math.random() * randomKeywords.length)]} Tamil`;
    
    // Fetch Artist-specific hits, Mood-specific hits, and a random query to guarantee a massive queue!
    Promise.all([
      artistQuery ? fetch(`/api/saavn/search?q=${encodeURIComponent(artistQuery)}`).then(r => r.json()).catch(() => []) : Promise.resolve([]),
      fetch(`/api/saavn/search?q=${encodeURIComponent(moodQuery)}`).then(r => r.json()).catch(() => []),
      fetch(`/api/saavn/search?q=${encodeURIComponent(randomQuery)}`).then(r => r.json()).catch(() => [])
    ]).then(([artistData, moodData, randomData]) => {
      const combined = [
        ...(Array.isArray(artistData) ? artistData : []), 
        ...(Array.isArray(moodData) ? moodData : []),
        ...(Array.isArray(randomData) ? randomData : [])
      ];
      // Remove duplicates
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      
      setSaavnRadioPool(prev => {
        if (keepQueue) {
          const merged = [...prev, ...unique];
          // Keep pool size manageable to prevent memory bloat
          return Array.from(new Map(merged.map(item => [item.id, item])).values()).slice(-500);
        } else {
          return unique;
        }
      });
    }).catch(err => console.error('Radio Engine Error:', err));
  }, [currentSong, isPlaying, incrementPlayCount, user]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying)      { audio.pause(); setIsPlaying(false); }
    else if (currentSong) { audio.play()?.catch(() => {});  setIsPlaying(true);  }
  }, [isPlaying, currentSong]);

  // ─── Dynamic Queue / Recommendation Engine ────────────────────────────────
  const upNextQueue = useMemo(() => {
    if (!currentSong || allSongs.length === 0) return [];
    
    // If the user has a custom explicit queue, it ALWAYS takes priority.
    if (customQueue.length > 0) {
      return [...customQueue];
    }

    // If there is no custom queue, respect the Autoplay setting.
    if (!autoplayEnabled) {
      return []; // Stop playback
    }

    // --- INFINITE DJ (Autoplay) LOGIC ---
    
    // Memory engine: exclude all recently played songs to prevent any loops.
    const recentIds = new Set(recentlyPlayed.map(s => s.id));
    
    let availableSongs = allSongs.filter(s => s.id !== currentSong.id && !recentIds.has(s.id));

    // Fallback: If we have exhausted all new songs, allow the queue to reuse recently played songs
    // But exclude the VERY LAST played song (currentSong)
    if (availableSongs.length === 0) {
      availableSongs = allSongs.filter(s => s.id !== currentSong.id);
    }
    
    // Absolute Last Resort Fallback
    if (availableSongs.length === 0) {
      availableSongs = [...allSongs];
    }

    // Stable pseudo-random shuffle: Shuffles randomly but stays consistent for the given currentSong
    const hash = (str) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
      return h;
    };
    const seed = hash(currentSong.id);
    const shuffledAvailable = [...availableSongs].sort((a, b) => (hash(a.id) ^ seed) - (hash(b.id) ^ seed));

    if (isShuffle) {
      return shuffledAvailable.slice(0, 300);
    }

    // Per user request: "Right now upcoming also relate while playing song"
    const currentMood = (currentSong.mood || '').toLowerCase();
    const currentArtist = (currentSong.artist || '').toLowerCase();
    const currentActor = (currentSong.actor || '').toLowerCase();

    // Helper for fuzzy artist matching
    const matchArtist = (a1, a2) => {
      if (!a1 || !a2) return false;
      const primary1 = a1.split(',')[0].trim();
      const primary2 = a2.split(',')[0].trim();
      return primary1.includes(primary2) || primary2.includes(primary1);
    };
    
    // Tier 1: Perfect Match (Same Mood AND Same Artist/Actor)
    const tier1 = shuffledAvailable.filter(s => 
      (s.mood || '').toLowerCase() === currentMood && 
      (matchArtist((s.artist || '').toLowerCase(), currentArtist) || (s.actor && (s.actor || '').toLowerCase() === currentActor))
    );
    const tier1Ids = new Set(tier1.map(s => s.id));
    
    // Tier 2: Mood Match
    const tier2 = shuffledAvailable.filter(s => (s.mood || '').toLowerCase() === currentMood && !tier1Ids.has(s.id));
    const tier2Ids = new Set(tier2.map(s => s.id));

    // Tier 3: Artist/Actor Match
    const tier3 = shuffledAvailable.filter(s => 
      (matchArtist((s.artist || '').toLowerCase(), currentArtist) || (s.actor && (s.actor || '').toLowerCase() === currentActor)) && 
      !tier1Ids.has(s.id) && !tier2Ids.has(s.id)
    );
    const tier3Ids = new Set(tier3.map(s => s.id));
    
    // Tier 4: Everything else (when related songs run out)
    const others = shuffledAvailable.filter(s => !tier1Ids.has(s.id) && !tier2Ids.has(s.id) && !tier3Ids.has(s.id));
    
    return [...tier1, ...tier2, ...tier3, ...others];
  }, [currentSong, allSongs, isShuffle, recentlyPlayed, customQueue, autoplayEnabled]);

  // ─── Background Audio Prefetcher ──────────────────────────────────────────
  useEffect(() => {
    if (!upNextQueue || upNextQueue.length === 0) return;
    const upcoming = upNextQueue.slice(0, 10); // Look ahead 10 songs to survive long background play

    upcoming.forEach(song => {
      const cached = streamUrlsRef.current[song.id];
      const isExpired = cached && cached.timestamp && (Date.now() - cached.timestamp) / (1000 * 60 * 60) > 6;
      
      if (song.id?.startsWith('saavn_') && !song.src && (!cached || isExpired || cached.url === 'failed')) {
        streamUrlsRef.current[song.id] = { url: 'fetching', timestamp: Date.now() };
        const cleanId = song.id.replace('saavn_', '');
        fetch(`/api/saavn/song/${cleanId}`)
          .then(res => res.ok ? res.json() : null)
          .then(detail => {
            if (detail && detail.src) {
              streamUrlsRef.current[song.id] = { url: detail.src, timestamp: Date.now() };
            } else {
              streamUrlsRef.current[song.id] = { url: 'failed', timestamp: Date.now() };
            }
          }).catch(() => {
            streamUrlsRef.current[song.id] = { url: 'failed', timestamp: Date.now() };
          });
      }
    });
  }, [upNextQueue]);

  // ─── Next / Prev ──────────────────────────────────────────────────────────
  const playNext = useCallback(() => {
    if (!currentSong) return;
    
    // Stop endless skipping loops (e.g. if internet disconnects or API goes down)
    if (skipCountRef.current >= 10) {
      setIsPlaying(false);
      audioRef.current.pause();
      skipCountRef.current = 0; // reset for next manual play
      alert("Playback stopped: Too many consecutive errors. Please check your connection or wait a moment.");
      return;
    }

    if (repeatMode === 'one') {
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.play()?.catch(() => {});
      setIsPlaying(true);
      return;
    }

    if (upNextQueue.length > 0) {
      const nextSong = upNextQueue[0];
      if (customQueue.length > 0 && nextSong.id === customQueue[0].id) {
        setCustomQueue(prev => {
          const next = prev.slice(1);
          try { localStorage.setItem('rhythmix_custom_queue', JSON.stringify(next)); } catch (e) {}
          return next;
        });
      }
      playSong(nextSong, true);
    } else {
      // If upNextQueue is empty (e.g. Autoplay is OFF and queue finished), stop playback
      setIsPlaying(false);
      audioRef.current.pause();
    }
  }, [currentSong, allSongs, playSong, repeatMode, upNextQueue, customQueue, autoplayEnabled, saavnHomeData]);

  const playNextRef = useRef(playNext);
  useEffect(() => { playNextRef.current = playNext; }, [playNext]);

  const playPrev = useCallback(() => {
    if (!currentSong || allSongs.length === 0) return;
    // If more than 3 seconds in, restart current song instead
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (recentlyPlayed.length > 1) {
      playSong(recentlyPlayed[1], true);
    } else {
      const idx = allSongs.findIndex(s => s.id === currentSong.id);
      playSong(allSongs[(idx - 1 + allSongs.length) % allSongs.length], true);
    }
  }, [currentSong, allSongs, playSong, recentlyPlayed]);

  // ─── Audio event listeners ────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    let lastTime = 0;
    const onTimeUpdate = () => {
      const now = Date.now();
      if (now - lastTime > 150) {
        setProgress(audio.currentTime);
        lastTime = now;
        // Reset skip counter on successful continuous playback
        if (audio.currentTime > 2) skipCountRef.current = 0;
      }
    };
    const onDurationChange  = () => setDuration(audio.duration);
    const onEnded           = () => playNextRef.current?.();
    const onError           = () => {
      console.error('Audio element error triggered! Stream might be expired.');
      skipCountRef.current += 1;
      playNextRef.current?.();
    };
    const onVolumeChange    = () => setVolume(audio.volume);
    
    audio.addEventListener('timeupdate',      onTimeUpdate);
    audio.addEventListener('durationchange',  onDurationChange);
    audio.addEventListener('ended',           onEnded);
    audio.addEventListener('error',           onError);
    audio.addEventListener('volumechange',    onVolumeChange);
    
    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('error',          onError);
      audio.removeEventListener('volumechange',   onVolumeChange);
    };
  }, []);

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      // Ignore when typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.shiftKey) { playNextRef.current?.(); }
          else { const a = audioRef.current; a.currentTime = Math.min(a.duration || 0, a.currentTime + 5); }
          break;
        case 'ArrowLeft':
          if (e.shiftKey) { playPrev(); }
          else { const a = audioRef.current; a.currentTime = Math.max(0, a.currentTime - 5); }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(v => { const nv = Math.min(1, v + 0.1); audioRef.current.volume = nv; return nv; });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => { const nv = Math.max(0, v - 0.1); audioRef.current.volume = nv; return nv; });
          break;
        case 'm': case 'M':
          setVolume(v => { const nv = v > 0 ? 0 : 0.8; audioRef.current.volume = nv; return nv; });
          break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, playPrev]);

  // ─── Sleep timer ──────────────────────────────────────────────────────────
  const startSleepTimer = useCallback((minutes) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    setSleepTimer(minutes);
    let remaining = minutes;
    sleepTimerRef.current = setInterval(() => {
      remaining -= 1;
      setSleepTimer(remaining);
      if (remaining <= 0) {
        clearInterval(sleepTimerRef.current);
        setSleepTimer(null);
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }, 60000); // tick every minute
  }, []);

  const cancelSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    setSleepTimer(null);
  }, []);

  // ─── Seek / Volume / Stop ─────────────────────────────────────────────────
  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  }, []);

  const changeVolume = useCallback((val) => {
    audioRef.current.volume = val;
    setVolume(val);
  }, []);

  const goBack = useCallback((fallback = 'home') => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      setActiveSection(fallback);
    }
  }, [setActiveSection]);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    audio.pause();
    audio.src = '';
    setCurrentSong(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    cancelSleepTimer();

    // If they were on the playback screen, bring them back home so they don't see a blank "No song playing" page
    setActiveSection(prev => prev === 'now-playing' ? 'home' : prev);
  }, [cancelSleepTimer]);

  // ─── Provide context ──────────────────────────────────────────────────────
  return (
    <PlayerContext.Provider value={{
      user,
      currentSong, isPlaying, progress, duration, volume,
      recentlyPlayed, allSongs, loading, favorites, playCounts, albumCovers,
      playSong, togglePlay, playNext, playPrev, seek, changeVolume, toggleLike,
      activeSection, setActiveSection, goBack, activeArtist, setActiveArtist,
      activeActor, setActiveActor,
      
      musicLanguages, setMusicLanguages,
      appLanguage, setAppLanguage,
      reduceAnimations, setReduceAnimations,
      infiniteDj, setInfiniteDj,
      gaplessPlayback, setGaplessPlayback,
      autoplayEnabled, setAutoplayEnabled,
      monoAudio, setMonoAudio,
      deviceBroadcast, setDeviceBroadcast,
      pictureInPicture, setPictureInPicture,
      dataSaverMode, setDataSaverMode,
      cellularDownloads, setCellularDownloads,
      audioOnlyDownloads, setAudioOnlyDownloads,
      audioOnlyStreaming, setAudioOnlyStreaming,
      wifiQuality, setWifiQuality,
      cellularQuality, setCellularQuality,
      autoAdjustQuality, setAutoAdjustQuality,
      downloadQuality, setDownloadQuality,
      isShuffle, setIsShuffle, 
      repeatMode, setRepeatMode,
      stopPlayback,
      activeSection, setActiveSection,
      sleepTimer, startSleepTimer, cancelSleepTimer,
      refreshSongs: () => {},
      upNextQueue: upNextQueue.length > 0 ? upNextQueue : (currentSong ? [currentSong] : []),
      customQueue, setCustomQueue, playNextSong, addToQueue, clearQueue,
      playlists, createPlaylist, deletePlaylist, addSongToPlaylist, removeSongFromPlaylist,
      isPlaylistModalOpen, openPlaylistModal, closePlaylistModal, songForPlaylist,
      saavnResults,
      saavnLoading,
      searchSaavnGlobal,
      saavnHomeData,
      saavnHomeLoading,
      fetchSaavnHome,
      setSleepTimer,
      lyricsData,
      lyricsLoading,
      lyricsError
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
