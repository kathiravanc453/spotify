import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import songs from '../data/songs.json';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => playNext();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const playSong = useCallback((song) => {
    const audio = audioRef.current;
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
      return;
    }
    audio.src = song.src;
    audio.play();
    setCurrentSong(song);
    setIsPlaying(true);
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 10);
    });
  }, [currentSong, isPlaying]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else if (currentSong) {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying, currentSong]);

  const playNext = useCallback(() => {
    if (!currentSong) return;
    const idx = songs.findIndex(s => s.id === currentSong.id);
    const next = songs[(idx + 1) % songs.length];
    playSong(next);
  }, [currentSong, playSong]);

  const playPrev = useCallback(() => {
    if (!currentSong) return;
    const idx = songs.findIndex(s => s.id === currentSong.id);
    const prev = songs[(idx - 1 + songs.length) % songs.length];
    playSong(prev);
  }, [currentSong, playSong]);

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  }, []);

  const changeVolume = useCallback((val) => {
    audioRef.current.volume = val;
    setVolume(val);
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, progress, duration, volume,
      recentlyPlayed, allSongs: songs,
      playSong, togglePlay, playNext, playPrev, seek, changeVolume
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
