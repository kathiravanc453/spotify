import { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { splitArtists } from '../utils/cleanTitle';

const PlayerContext = createContext(null);

export function PlayerProvider({ children, user }) {

  const [currentSong, setCurrentSong]   = useState(null);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [progress, setProgress]         = useState(0);
  const [duration, setDuration]         = useState(0);
  const [volume, setVolume]             = useState(0.8);
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_recently_played')) || []; } catch { return []; }
  });
  const [loading, setLoading]           = useState(false);
  const [favorites, setFavorites]       = useState([]);
  const loadedRef                       = useRef(true);
  const [activeSection, setActiveSection] = useState('home');
  const [activeArtist, setActiveArtist] = useState(null);
  const [activeActor, setActiveActor] = useState(null);
  const [saavnResults, setSaavnResults] = useState([]);
  const [saavnLoading, setSaavnLoading] = useState(false);
  const [saavnRadioPool, setSaavnRadioPool] = useState([]);

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
    try { return JSON.parse(localStorage.getItem('rhythmix_repeat') || '"off"'); } catch { return 'off'; }
  });

  const audioRef = useRef(null);
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

  // ─── GLOBAL SAAVN SEARCH ──────────────────────────────────────────────────
  const searchSaavnGlobal = async (query) => {
    if (!query || query.trim() === '') {
      setSaavnResults([]);
      return;
    }
    setSaavnLoading(true);
    try {
      const res = await fetch(`/api/saavn/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setSaavnResults(Array.isArray(data) ? data : []);
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
      const res = await fetch('/api/saavn/home');
      const data = await res.json();
      if (data && data.trending) {
        setSaavnHomeData(data);
      }
    } catch (e) {
      console.error('Saavn Home Error:', e);
    } finally {
      setSaavnHomeLoading(false);
    }
  }, []);

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
  const playSong = useCallback((song, keepQueue = false) => {
    if (!user) {
      setActiveSection('login');
      return;
    }

    const audio = audioRef.current;
    if (currentSong?.id === song.id) {
      if (isPlaying) { audio.pause(); setIsPlaying(false); }
      else           { audio.play();  setIsPlaying(true);  }
      return;
    }
    audio.src = song.src;
    audio.play()?.catch(() => {});
    setCurrentSong(song);
    setIsPlaying(true);
    incrementPlayCount(song.id);
    
    // Auto-navigate to Now Playing screen as requested by user
    setActiveSection('now-playing');

    // Remove from custom queue if playing it manually
    setCustomQueue(prev => {
      const next = prev.filter(s => s.id !== song.id);
      try { localStorage.setItem('rhythmix_custom_queue', JSON.stringify(next)); } catch (e) {}
      return next;
    });

    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      const next = [song, ...filtered].slice(0, 100);
      try { localStorage.setItem('rhythmix_recently_played', JSON.stringify(next)); } catch (e) {}
      return next;
    });

    // Smart Radio Engine: Fetch 300+ related songs silently in the background
    const rawArtist = song.artist && song.artist !== 'Unknown Artist' ? song.artist.split(',')[0] : '';
    const artistQuery = rawArtist ? `${rawArtist} Tamil` : '';
    const moodQuery = `${song.mood || 'hits'} Tamil`;
    
    // Fetch both Artist-specific hits AND Mood-specific hits to guarantee a massive 200+ song queue!
    Promise.all([
      artistQuery ? fetch(`/api/saavn/search?q=${encodeURIComponent(artistQuery)}`).then(r => r.json()).catch(() => []) : Promise.resolve([]),
      fetch(`/api/saavn/search?q=${encodeURIComponent(moodQuery)}`).then(r => r.json()).catch(() => [])
    ]).then(([artistData, moodData]) => {
      const combined = [...(Array.isArray(artistData) ? artistData : []), ...(Array.isArray(moodData) ? moodData : [])];
      // Remove duplicates
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      
      setSaavnRadioPool(prev => {
        if (keepQueue) {
          const merged = [...prev, ...unique];
          return Array.from(new Map(merged.map(item => [item.id, item])).values());
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
    
    // Memory engine: exclude all recently played songs to prevent any loops.
    const recentIds = new Set(recentlyPlayed.map(s => s.id));
    const customIds = new Set(customQueue.map(s => s.id));
    
    let availableSongs = allSongs.filter(s => s.id !== currentSong.id && !recentIds.has(s.id) && !customIds.has(s.id));

    // Fallback: If we have exhausted all new songs, allow the queue to reuse recently played songs
    if (availableSongs.length === 0) {
      availableSongs = allSongs.filter(s => s.id !== currentSong.id && !customIds.has(s.id));
    }
    
    // Absolute Last Resort Fallback: If there is literally only 1 song in the entire app state
    if (availableSongs.length === 0) {
      availableSongs = [...allSongs];
    }

    // Shuffle the available songs deterministically based on the current song.
    const shuffledAvailable = [...availableSongs].sort((a, b) => {
      const hashA = String(a.id) + String(currentSong.id);
      const hashB = String(b.id) + String(currentSong.id);
      const valA = hashA.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const valB = hashB.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return valA - valB;
    });

    let recommended = [];
    if (isShuffle) {
      // Pure random shuffle ignoring mood
      recommended = shuffledAvailable.slice(0, 300);
    } else {
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
      
      recommended = [...tier1, ...tier2, ...tier3, ...others];
    }

    return [...customQueue, ...recommended];
  }, [currentSong, allSongs, isShuffle, recentlyPlayed, customQueue]);

  // ─── Next / Prev ──────────────────────────────────────────────────────────
  const playNext = useCallback(() => {
    if (!currentSong || allSongs.length === 0) return;
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
      playSong(allSongs[0], true);
    }
  }, [currentSong, allSongs, playSong, repeatMode, upNextQueue, customQueue]);

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
      if (now - lastTime > 1000) {
        setProgress(audio.currentTime);
        lastTime = now;
      }
    };
    const onDurationChange  = () => setDuration(audio.duration);
    const onEnded           = () => playNextRef.current?.();
    const onVolumeChange    = () => setVolume(audio.volume);
    
    audio.addEventListener('timeupdate',      onTimeUpdate);
    audio.addEventListener('durationchange',  onDurationChange);
    audio.addEventListener('ended',           onEnded);
    audio.addEventListener('volumechange',    onVolumeChange);
    
    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended',          onEnded);
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

  // ─── Playlists ────────────────────────────────────────────────────────────
  const [playlists, setPlaylists] = useState([]);

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

  const addSongToPlaylist = useCallback((playlistId, songId) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        if (!p.songs.includes(songId)) {
          return { ...p, songs: [...p.songs, songId] };
        }
      }
      return p;
    });
    savePlaylists(updated);
  }, [playlists, savePlaylists]);

  const removeSongFromPlaylist = useCallback((playlistId, songId) => {
    const updated = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(id => id !== songId) };
      }
      return p;
    });
    savePlaylists(updated);
  }, [playlists, savePlaylists]);

  const deletePlaylist = useCallback((playlistId) => {
    const updated = playlists.filter(p => p.id !== playlistId);
    savePlaylists(updated);
  }, [playlists, savePlaylists]);

  // ─── Seek / Volume / Stop ─────────────────────────────────────────────────
  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  }, []);

  const changeVolume = useCallback((val) => {
    audioRef.current.volume = val;
    setVolume(val);
  }, []);

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
      currentSong, isPlaying, progress, duration, volume,
      recentlyPlayed, allSongs, loading, favorites, playCounts, albumCovers,
      playSong, togglePlay, playNext, playPrev, seek, changeVolume, toggleLike,
      activeSection, setActiveSection, activeArtist, setActiveArtist,
      activeActor, setActiveActor,
      isShuffle, setIsShuffle, repeatMode, setRepeatMode,
      stopPlayback,
      sleepTimer, startSleepTimer, cancelSleepTimer,
      refreshSongs: () => {},
      upNextQueue: upNextQueue.length > 0 ? upNextQueue : (currentSong ? [currentSong] : []),
      customQueue, playNextSong, addToQueue, clearQueue,
      playlists, fetchPlaylists, createPlaylist, addSongToPlaylist, removeSongFromPlaylist, deletePlaylist,
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
