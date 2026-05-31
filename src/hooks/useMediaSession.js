import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { cleanTitle } from '../utils/cleanTitle';

/**
 * Media Session API hook.
 * Syncs current song metadata to the browser's media session so it shows
 * on the device lock screen / notification bar with play/pause/skip controls.
 */
export default function useMediaSession() {
  const {
    currentSong, isPlaying,
    togglePlay, playNext, playPrev, seek, duration,
  } = usePlayer() || {};

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (!currentSong) {
      navigator.mediaSession.metadata = null;
      return;
    }

    // Set Now Playing metadata on the OS notification / lock screen
    navigator.mediaSession.metadata = new MediaMetadata({
      title:  cleanTitle(currentSong.title) || currentSong.title,
      artist: currentSong.artist || 'Cloud Artist',
      album:  currentSong.album  || 'Rhythmix',
      artwork: [
        { src: currentSong.cover, sizes: '512x512', type: 'image/jpeg' },
        { src: currentSong.cover, sizes: '256x256', type: 'image/jpeg' },
      ],
    });

    // Wire OS media buttons → Rhythmix controls
    navigator.mediaSession.setActionHandler('play',          () => { if (!isPlaying) togglePlay?.(); });
    navigator.mediaSession.setActionHandler('pause',         () => { if (isPlaying)  togglePlay?.(); });
    navigator.mediaSession.setActionHandler('nexttrack',     () => playNext?.());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrev?.());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) seek?.(details.seekTime);
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [currentSong, isPlaying, togglePlay, playNext, playPrev, seek]);

  // Keep position state updated (for lock screen seek bar)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !duration) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: 0,
      });
    } catch {}
  }, [duration]);
}
