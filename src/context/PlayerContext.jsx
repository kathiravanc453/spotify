import { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children, user }) {
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
  const [albumCovers, setAlbumCovers]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('rhythmix_album_covers_v2') || '{}') || {}; } catch { return {}; }
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

  // ─── Fetch songs — with direct Cloudinary fallback ───────────────────────
  const fetchSongs = useCallback(async () => {
    // 1. Try Vercel serverless API first
    try {
      const res         = await fetch(`/api/songs?t=${Date.now()}`);
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error(`Backend unavailable (${res.status})`);
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAllSongs(data);
        if (!loadedRef.current) { loadedRef.current = true; setLoading(false); }
        return;
      }
      throw new Error('API returned empty array');
    } catch (err) {
      console.warn('[Rhythmix] Vercel API failed:', err.message, '— trying Cloudinary direct...');
    }

    // 2. Try Cloudinary REST API directly from the browser
    try {
      const CLOUD_NAME = 'dm1cwbbfg';
      const API_KEY    = '969989851682274';
      const API_SECRET = '6N9cJ9fhanGad1sj--3gssD-vCk';
      const auth = btoa(`${API_KEY}:${API_SECRET}`);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/video?resource_type=video&max_results=500&type=upload`,
        { headers: { Authorization: `Basic ${auth}` } }
      );
      const data = await res.json();
      const resources = data.resources || [];

      const getStableId = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = (hash << 5) - hash + str.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash);
      };

      const songs = resources
        .filter(r => r.format === 'mp3' || r.format === 'm4a')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(r => {
          let title = (r.display_name || r.public_id.split('/').pop() || 'Unknown')
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\b[a-z0-9]{6}\b$/i, '')
            .replace(/(high quality|audio|bass boosted|mp3|m4a|128k|320k)/gi, '')
            .replace(/\s{2,}/g, ' ').trim();
          let artist = 'Unknown Artist';
          if (title.includes(' - ')) {
            const parts = title.split(' - ');
            artist = parts[0].trim();
            title  = parts.slice(1).join(' - ').trim();
          }
          return {
            id:           getStableId(r.secure_url),
            title,
            artist,
            src:          r.secure_url,
            cover:        'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500',
            fallbackCover:'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500',
            album:        'Cloudinary',
            mood:         'Melody',
            genre:        'Tamil',
            uploadedAt:   r.created_at,
            duration:     r.duration || 0,
          };
        });

      if (songs.length > 0) {
        console.log(`[Rhythmix] Loaded ${songs.length} songs directly from Cloudinary`);
        setAllSongs(songs);
        if (!loadedRef.current) { loadedRef.current = true; setLoading(false); }
        return;
      }
    } catch (err) {
      console.warn('[Rhythmix] Cloudinary direct fetch failed:', err.message);
    }

    // 3. Final fallback: static songs.json
    console.warn('[Rhythmix] Using static fallback songs.json');
    try {
      const mod = await import('../data/songs.json');
      if (Array.isArray(mod.default) && mod.default.length > 0) {
        setAllSongs(mod.default);
      }
    } catch {}
    if (!loadedRef.current) { loadedRef.current = true; setLoading(false); }
  }, []); // ← empty deps: stable reference, no re-render loop

  useEffect(() => {
    // Initial load
    fetchSongs();

    // 🔄 Auto-refresh every 30 seconds — new Cloudinary uploads appear automatically
    const poll = setInterval(async () => {
      try {
        const CLOUD_NAME = 'dm1cwbbfg';
        const API_KEY    = '969989851682274';
        const API_SECRET = '6N9cJ9fhanGad1sj--3gssD-vCk';
        const auth = btoa(`${API_KEY}:${API_SECRET}`);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/video?resource_type=video&max_results=500&type=upload`,
          { headers: { Authorization: `Basic ${auth}` } }
        );
        const data = await res.json();
        const resources = data.resources || [];

        const getStableId = (str) => {
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
          }
          return Math.abs(hash);
        };

        const freshSongs = resources
          .filter(r => r.format === 'mp3' || r.format === 'm4a')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map(r => {
            let title = (r.display_name || r.public_id.split('/').pop() || 'Unknown')
              .replace(/[-_]/g, ' ')
              .replace(/\s+/g, ' ')
              .replace(/\b[a-z0-9]{6}\b$/i, '')
              .replace(/(high quality|audio|bass boosted|mp3|m4a|128k|320k)/gi, '')
              .replace(/\s{2,}/g, ' ').trim();
            let artist = 'Unknown Artist';
            if (title.includes(' - ')) {
              const parts = title.split(' - ');
              artist = parts[0].trim();
              title  = parts.slice(1).join(' - ').trim();
            }
            return {
              id: getStableId(r.secure_url), title, artist, src: r.secure_url,
              cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500',
              fallbackCover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500',
              album: 'Cloudinary', mood: 'Melody', genre: 'Tamil',
              uploadedAt: r.created_at, duration: r.duration || 0,
            };
          });

        if (freshSongs.length > 0) {
          setAllSongs(prev => {
            // Only update if we have new songs (avoids unnecessary re-renders)
            if (freshSongs.length !== prev.length) {
              console.log(`[Rhythmix] 🔄 Auto-synced: ${freshSongs.length} songs (was ${prev.length})`);
              return freshSongs;
            }
            return prev;
          });
        }
      } catch (err) {
        // Silently ignore poll errors — don't disrupt the user
      }
    }, 30000); // every 30 seconds

    return () => clearInterval(poll);
  }, [fetchSongs]);

  // ─── Play count tracking ──────────────────────────────────────────────────
  const incrementPlayCount = useCallback((songId) => {
    setPlayCounts(prev => {
      const updated = { ...prev, [songId]: (prev[songId] || 0) + 1 };
      localStorage.setItem('rhythmix_playcounts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ─── Album Art Hydration Engine (via /api/artwork backend) ───────────────
  useEffect(() => {
    if (allSongs.length === 0) return;

    let isSubscribed = true;

    // Generic fallbacks we want to REPLACE with a real album art
    const GENERIC_COVERS = [
      '/favicon.svg',
      'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500',
    ];

    const needsArtwork = (song) => {
      if (!song.cover) return true;
      return GENERIC_COVERS.some(g => song.cover === g);
    };

    const hydrateCovers = async () => {
      // New cache that stores full metadata { cover, artist, album }
      let cachedMeta = {};
      try { cachedMeta = JSON.parse(localStorage.getItem('rhythmix_metadata_v1') || '{}') || {}; } catch {}

      const songsToHydrate = [];
      let hasInstantUpdates = false;
      const initialUpdates = {};

      for (const song of allSongs) {
        if (!isSubscribed) break;

        const meta = cachedMeta[song.id];
        const needsArt = !meta?.cover || GENERIC_COVERS.includes(meta.cover);
        
        // If we already have cached metadata for this song, apply it immediately
        if (meta && (meta.artist || meta.album || !needsArt)) {
          initialUpdates[song.id] = meta;
          hasInstantUpdates = true;
        }

        // Only hit the API if we don't have metadata or the cover is generic
        if (!meta || needsArt || (song.artist === 'Unknown Artist' && !meta.artist)) {
          songsToHydrate.push(song);
        }
      }

      // Apply cached metadata instantly before doing API calls
      if (hasInstantUpdates) {
        setAllSongs(prev => {
          let changed = false;
          const next = prev.map(s => {
            const m = initialUpdates[s.id];
            if (!m) return s;
            const newCover = m.cover && !GENERIC_COVERS.includes(m.cover) ? m.cover : s.cover;
            const newArtist = m.artist && m.artist !== 'Unknown Artist' ? m.artist : s.artist;
            const newAlbum = m.album && m.album !== 'Cloudinary Singles' ? m.album : s.album;
            
            if (s.cover !== newCover || s.artist !== newArtist || s.album !== newAlbum) {
              changed = true;
              return { ...s, cover: newCover, artist: newArtist, album: newAlbum };
            }
            return s;
          });
          return changed ? next : prev;
        });
      }

      const BATCH_SIZE = 8;
      for (let i = 0; i < songsToHydrate.length; i += BATCH_SIZE) {
        if (!isSubscribed) break;
        
        const batch = songsToHydrate.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (song) => {
          try {
            const params = new URLSearchParams({ title: song.title, artist: song.artist || '' });
            const res = await fetch(`/api/artwork?${params}`);
            const data = await res.json();
            
            const finalCover = data.coverUrl || song.cover || null;
            const finalArtist = data.artist && data.artist !== 'Unknown Artist' ? data.artist : null;
            const finalAlbum = data.album && data.album !== 'Cloudinary Singles' ? data.album : null;
            
            // Save to local cache
            cachedMeta[song.id] = { cover: finalCover, artist: finalArtist, album: finalAlbum };
            localStorage.setItem('rhythmix_metadata_v1', JSON.stringify(cachedMeta));
            
            // Update state safely to avoid React infinite loops
            setAllSongs(prevSongs => {
              let changed = false;
              const next = prevSongs.map(s => {
                if (s.id === song.id) {
                  const newCover = finalCover && !GENERIC_COVERS.includes(finalCover) ? finalCover : s.cover;
                  const newArtist = finalArtist || s.artist;
                  const newAlbum = finalAlbum || s.album;
                  
                  if (s.cover !== newCover || s.artist !== newArtist || s.album !== newAlbum) {
                    changed = true;
                    return { ...s, cover: newCover, artist: newArtist, album: newAlbum };
                  }
                }
                return s;
              });
              return changed ? next : prevSongs;
            });

          } catch (err) {
            console.error(`[Artwork] Failed for "${song.title}":`, err);
          }
        }));

        await new Promise(r => setTimeout(r, 50));
      }
    };

    hydrateCovers();

    return () => { isSubscribed = false; };
  }, [allSongs]);

  // ─── Play song ────────────────────────────────────────────────────────────
  const playSong = useCallback((song) => {
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
  }, [currentSong, isPlaying, incrementPlayCount, user]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying)      { audio.pause(); setIsPlaying(false); }
    else if (currentSong) { audio.play();  setIsPlaying(true);  }
  }, [isPlaying, currentSong]);

  // ─── Dynamic Queue / Recommendation Engine ────────────────────────────────
  const upNextQueue = useMemo(() => {
    if (!currentSong || allSongs.length === 0) return [];
    
    if (isShuffle) {
      const remaining = allSongs.filter(s => s.id !== currentSong.id);
      // Deterministic pseudo-shuffle based on current song id to prevent rapid reshuffling on re-renders
      return [...remaining].sort((a, b) => {
        const hashA = a.title.charCodeAt(0) + (currentSong.id.charCodeAt(0) || 0);
        const hashB = b.title.charCodeAt(0) + (currentSong.id.charCodeAt(0) || 0);
        return (hashA % 3) - (hashB % 3);
      }).slice(0, 10);
    }
    
    // Suggestion engine: 1. Same mood, 2. Same artist
    const related = allSongs.filter(s => s.id !== currentSong.id && (s.mood === currentSong.mood || s.artist === currentSong.artist));
    const others = allSongs.filter(s => s.id !== currentSong.id && s.mood !== currentSong.mood && s.artist !== currentSong.artist);
    
    return [...related, ...others].slice(0, 10);
  }, [currentSong, allSongs, isShuffle]);

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
    if (upNextQueue.length > 0) {
      playSong(upNextQueue[0]);
    } else {
      playSong(allSongs[0]);
    }
  }, [currentSong, allSongs, playSong, repeatMode, upNextQueue]);

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
      playSong(recentlyPlayed[1]);
    } else {
      const idx = allSongs.findIndex(s => s.id === currentSong.id);
      playSong(allSongs[(idx - 1 + allSongs.length) % allSongs.length]);
    }
  }, [currentSong, allSongs, playSong, recentlyPlayed]);

  // ─── Audio event listeners ────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    const onTimeUpdate      = () => setProgress(audio.currentTime);
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
      activeSection, setActiveSection,
      isShuffle, setIsShuffle, repeatMode, setRepeatMode,
      stopPlayback,
      sleepTimer, startSleepTimer, cancelSleepTimer,
      refreshSongs: fetchSongs,
      upNextQueue,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
