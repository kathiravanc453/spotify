import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [allSongs, setAllSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [activeSection, setActiveSection] = useState('home');
  const [isShuffle, setIsShuffle] = useState(() => {
    try {
      const saved = localStorage.getItem('rhythmix_shuffle');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [repeatMode, setRepeatMode] = useState(() => {
    try {
      const saved = localStorage.getItem('rhythmix_repeat');
      return saved ? JSON.parse(saved) : 'off';
    } catch {
      return 'off';
    }
  });
  const audioRef = useRef(new Audio());

  useEffect(() => {
    localStorage.setItem('rhythmix_shuffle', JSON.stringify(isShuffle));
  }, [isShuffle]);

  useEffect(() => {
    localStorage.setItem('rhythmix_repeat', JSON.stringify(repeatMode));
  }, [repeatMode]);

  // Load user-specific favorites from localStorage
  useEffect(() => {
    const loadFavs = () => {
      try {
        const session = localStorage.getItem('rhythmix_session');
        const userEmail = session ? JSON.parse(session)?.email : 'default';
        const saved = localStorage.getItem(`rhythmix_favorites_${userEmail}`);
        setFavorites(saved ? JSON.parse(saved) : []);
      } catch {
        setFavorites([]);
      }
    };
    loadFavs();

    // Listen to storage events to keep favorites synced
    window.addEventListener('storage', loadFavs);
    return () => window.removeEventListener('storage', loadFavs);
  }, []);

  const toggleLike = useCallback((songId) => {
    try {
      const session = localStorage.getItem('rhythmix_session');
      const userEmail = session ? JSON.parse(session)?.email : 'default';
      const key = `rhythmix_favorites_${userEmail}`;
      
      setFavorites(prev => {
        const next = prev.includes(songId)
          ? prev.filter(id => id !== songId)
          : [...prev, songId];
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  }, []);
 
  const fetchSongs = useCallback(async () => {
    try {
      const res = await fetch('/api/songs');
      const data = await res.json();
      setAllSongs(data);
    } catch (err) {
      console.error('Fetch error:', err);
      // Fallback to static if backend is down
      try {
        const mod = await import('../data/songs.json');
        setAllSongs(mod.default || []);
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
    // Auto-refresh every 10 seconds to catch new syncs from Cloudinary
    const interval = setInterval(fetchSongs, 10000);
    return () => clearInterval(interval);
  }, [fetchSongs]);

  const playSong = useCallback((song) => {
    const audio = audioRef.current;
    if (currentSong?.id === song.id) {
      if (isPlaying) { audio.pause(); setIsPlaying(false); }
      else { audio.play(); setIsPlaying(true); }
      return;
    }
    audio.src = song.src;
    audio.play();
    setCurrentSong(song);
    setIsPlaying(true);
    setActiveSection('now-playing');
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 10);
    });
  }, [currentSong, isPlaying, setActiveSection]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else if (currentSong) { audio.play(); setIsPlaying(true); }
  }, [isPlaying, currentSong]);

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
      let randomIdx;
      const currentIdx = allSongs.findIndex(s => s.id === currentSong.id);
      do {
        randomIdx = Math.floor(Math.random() * allSongs.length);
      } while (randomIdx === currentIdx && allSongs.length > 1);
      playSong(allSongs[randomIdx]);
      return;
    }

    const idx = allSongs.findIndex(s => s.id === currentSong.id);
    const next = allSongs[(idx + 1) % allSongs.length];
    playSong(next);
  }, [currentSong, allSongs, playSong, isShuffle, repeatMode]);

  const playNextRef = useRef(playNext);
  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (playNextRef.current) {
        playNextRef.current();
      }
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const playPrev = useCallback(() => {
    if (!currentSong || allSongs.length === 0) return;
    const idx = allSongs.findIndex(s => s.id === currentSong.id);
    const prev = allSongs[(idx - 1 + allSongs.length) % allSongs.length];
    playSong(prev);
  }, [currentSong, allSongs, playSong]);

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
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, progress, duration, volume,
      recentlyPlayed, allSongs, loading, favorites,
      playSong, togglePlay, playNext, playPrev, seek, changeVolume, toggleLike,
      activeSection, setActiveSection, isShuffle, setIsShuffle, repeatMode, setRepeatMode,
      stopPlayback
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
