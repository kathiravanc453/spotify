import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [allSongs, setAllSongs]         = useState([]);
  const [currentSong, setCurrentSong]   = useState(null);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [progress, setProgress]         = useState(0);
  const [duration, setDuration]         = useState(0);
  const [volume, setVolume]             = useState(0.8);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [favorites, setFavorites]       = useState([]);
  const [activeSection, setActiveSection] = useState('home');
  const [sleepTimer, setSleepTimer]     = useState(null); // minutes remaining
  const [playCounts, setPlayCounts]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_playcounts') || '{}') || {}; } catch { return {}; }
  });

  const [isShuffle, setIsShuffle] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_shuffle') || 'false'); } catch { return false; }
  });
  const [repeatMode, setRepeatMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_repeat') || '"off"'); } catch { return 'off'; }
  });

  const audioRef     = useRef(new Audio());
  const sleepTimerRef = useRef(null);
  const loadedRef    = useRef(false); // fix infinite re-render: track first load with ref not state

  // ─── Persist shuffle / repeat ────────────────────────────────────────────
  useEffect(() => { localStorage.setItem('rhythmix_shuffle', JSON.stringify(isShuffle)); }, [isShuffle]);
  useEffect(() => { localStorage.setItem('rhythmix_repeat',  JSON.stringify(repeatMode)); }, [repeatMode]);

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

  // ─── Fetch songs — FIXED: no `loading` in dep array (caused infinite loop) ─
  const fetchSongs = useCallback(async () => {
    try {
      const res         = await fetch('/api/songs');
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error(`Backend unavailable (${res.status})`);
      }
      const data = await res.json();
      if (Array.isArray(data)) setAllSongs(data);
    } catch {
      if (!loadedRef.current) console.warn('[Rhythmix] Backend offline — using static fallback.');
      try {
        const mod = await import('../data/songs.json');
        if (Array.isArray(mod.default) && mod.default.length > 0) {
          setAllSongs(prev => prev.length === 0 ? mod.default : prev);
        }
      } catch {}
    } finally {
      if (!loadedRef.current) { loadedRef.current = true; setLoading(false); }
    }
  }, []); // ← empty deps: stable reference, no re-render loop

  useEffect(() => {
    fetchSongs();
    const interval = setInterval(fetchSongs, 20000);
    return () => clearInterval(interval);
  }, [fetchSongs]);

  // ─── Play count tracking ──────────────────────────────────────────────────
  const incrementPlayCount = useCallback((songId) => {
    setPlayCounts(prev => {
      const updated = { ...prev, [songId]: (prev[songId] || 0) + 1 };
      localStorage.setItem('rhythmix_playcounts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ─── Play song ────────────────────────────────────────────────────────────
  const playSong = useCallback((song) => {
    const audio = audioRef.current;
    if (currentSong?.id === song.id) {
      if (isPlaying) { audio.pause(); setIsPlaying(false); }
      else           { audio.play();  setIsPlaying(true);  }
      return;
    }
    audio.src = song.src;
    audio.play();
    setCurrentSong(song);
    setIsPlaying(true);
    incrementPlayCount(song.id);
    
    // Auto-navigate to Now Playing screen as requested by user
    setActiveSection('now-playing');

    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 10);
    });
  }, [currentSong, isPlaying, incrementPlayCount]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying)      { audio.pause(); setIsPlaying(false); }
    else if (currentSong) { audio.play();  setIsPlaying(true);  }
  }, [isPlaying, currentSong]);

  // ─── Next / Prev ──────────────────────────────────────────────────────────
  const playNext = useCallback(() => {
    if (!currentSong || allSongs.length === 0) return;
    if (repeatMode === 'one') {
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.play();
      setIsPlaying(true);
      return;
    }
    if (isShuffle && allSongs.length > 1) {
      const currentIdx = allSongs.findIndex(s => s.id === currentSong.id);
      let randomIdx;
      do { randomIdx = Math.floor(Math.random() * allSongs.length); }
      while (randomIdx === currentIdx && allSongs.length > 1);
      playSong(allSongs[randomIdx]);
      return;
    }
    const idx = allSongs.findIndex(s => s.id === currentSong.id);
    playSong(allSongs[(idx + 1) % allSongs.length]);
  }, [currentSong, allSongs, playSong, isShuffle, repeatMode]);

  const playNextRef = useRef(playNext);
  useEffect(() => { playNextRef.current = playNext; }, [playNext]);

  const playPrev = useCallback(() => {
    if (!currentSong || allSongs.length === 0) return;
    // If more than 3 seconds in, restart current song instead
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const idx = allSongs.findIndex(s => s.id === currentSong.id);
    playSong(allSongs[(idx - 1 + allSongs.length) % allSongs.length]);
  }, [currentSong, allSongs, playSong]);

  // ─── Audio event listeners ────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    const onTimeUpdate      = () => setProgress(audio.currentTime);
    const onDurationChange  = () => setDuration(audio.duration);
    const onEnded           = () => playNextRef.current?.();
    audio.addEventListener('timeupdate',      onTimeUpdate);
    audio.addEventListener('durationchange',  onDurationChange);
    audio.addEventListener('ended',           onEnded);
    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended',          onEnded);
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
      recentlyPlayed, allSongs, loading, favorites, playCounts,
      playSong, togglePlay, playNext, playPrev, seek, changeVolume, toggleLike,
      activeSection, setActiveSection,
      isShuffle, setIsShuffle, repeatMode, setRepeatMode,
      stopPlayback,
      sleepTimer, startSleepTimer, cancelSleepTimer,
      refreshSongs: fetchSongs,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
