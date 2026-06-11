import { useMemo, useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { cleanTitle, moodAccent, splitArtists } from '../utils/cleanTitle';
import { useSwipe } from '../hooks/useGestures';
import { toast } from '../components/ui/Toast';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart,
  ChevronLeft, Volume2, VolumeX, ListMusic, Sparkles, Share2, MonitorSpeaker
} from 'lucide-react';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Playback() {
  const {
    currentSong, isPlaying, progress, duration, volume,
    allSongs = [], favorites = [], isShuffle, setIsShuffle,
    repeatMode, setRepeatMode, playSong, togglePlay, playNext,
    playPrev, seek, changeVolume, toggleLike, setActiveSection, albumCovers = {}, setActiveArtist
  } = usePlayer() || {};

  const accent = moodAccent(currentSong?.mood);
  const displayTitle = cleanTitle(currentSong?.title || '');

  // Swipe left → next song, right → prev song, down → go back
  const swipeHandlers = useSwipe({
    onSwipeLeft:  () => playNext?.(),
    onSwipeRight: () => playPrev?.(),
    onSwipeDown:  () => setActiveSection('home'),
    threshold: 60,
  });

  // Share current song
  const handleShare = useCallback(async () => {
    const text = `🎵 ${displayTitle} — ${currentSong?.artist || 'Cloud Artist'} | Rhythmix`;
    try {
      if (navigator.share) {
        await navigator.share({ title: displayTitle, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Song info copied to clipboard!');
      }
    } catch {
      toast.error('Could not share song.');
    }
  }, [displayTitle, currentSong]);

  // Get upcoming songs to show in "Up Next" queue
  const queue = usePlayer()?.upNextQueue || [];

  // If there's no playing song, redirect back or render a loader
  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 space-y-4">
        <Sparkles className="text-cyan-400 animate-spin" size={40} />
        <p className="text-white/40 text-sm font-semibold">No song playing. Select a track from the Home screen!</p>
        <button
          onClick={() => setActiveSection('home')}
          className="px-6 py-2.5 rounded-2xl bg-cyan-400 text-black text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Go Home
        </button>
      </div>
    );
  }

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div
      className="relative min-h-[calc(100vh-55px)] md:min-h-[calc(100vh-140px)] pb-4 md:pb-8 w-full flex flex-col p-4 md:p-8 overflow-x-hidden"
    >
      {/* Blurred background cover art */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-[120px] opacity-40 scale-150 transition-all duration-1000"
          style={{ backgroundImage: `url(${albumCovers[currentSong.id] || currentSong.cover})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07070a]/40 to-[#07070a]/80" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto md:my-auto md:bg-white/[0.02] md:border md:border-white/5 md:backdrop-blur-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 flex flex-col md:flex-row gap-12 shadow-none md:shadow-2xl h-auto min-h-screen md:min-h-0">
        {/* Left Column: Playing Song Card Controls */}
        <div 
          className="flex-1 flex flex-col items-center md:items-start text-center md:text-left justify-between space-y-4 md:space-y-6 w-full max-w-md mx-auto md:max-w-none"
          {...swipeHandlers}
        >
          {/* Back Button + Share */}
          <div className="w-full flex items-center justify-between">
            <button
              onClick={() => setActiveSection('home')}
              className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-semibold cursor-pointer pb-2 border-b border-transparent hover:border-white/15"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            {/* Mobile swipe hint */}
            <p className="md:hidden text-white/20 text-[9px] font-semibold tracking-wider">
              ← swipe →
            </p>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-white/40 hover:text-cyan-400 transition-colors text-xs font-semibold cursor-pointer p-2 rounded-xl hover:bg-white/5"
              title="Share Song"
            >
              <Share2 size={15} />
              <span className="hidden sm:block">Share</span>
            </button>
          </div>

          {/* Album Art container with shadow & glow */}
          <div className="relative group w-full max-w-[240px] sm:max-w-[280px] md:max-w-none md:w-80 md:h-80 aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 mx-auto md:mx-0 flex-shrink-0 animate-in zoom-in-95 duration-500 bg-white/5">
            <img
              src={albumCovers[currentSong.id] || currentSong.cover}
              alt={currentSong.title}
              onError={(e) => {
                if (currentSong.fallbackCover && e.target.src !== currentSong.fallbackCover) {
                  e.target.src = currentSong.fallbackCover;
                } else {
                  e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
                }
              }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Subtle overlay */}
            <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>

          {/* Song Metadata */}
          <div className="w-full space-y-1.5 md:space-y-2 px-2 md:px-0">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 text-left">
                <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight truncate">{displayTitle}</h1>
                <div className="text-white/50 text-xs sm:text-sm md:text-base font-semibold mt-0.5 md:mt-1 w-full text-left flex items-center gap-1">
                  {splitArtists(currentSong.artist).map((artistName, i, arr) => (
                    <span key={artistName} className="truncate max-w-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (artistName && artistName !== 'Unknown Artist') {
                            setActiveArtist(artistName);
                            setActiveSection('artist');
                          }
                        }}
                        className="hover:text-white hover:underline transition-colors cursor-pointer"
                      >
                        {artistName}
                      </button>
                      {i < arr.length - 1 && <span>, </span>}
                    </span>
                  ))}
                </div>
              </div>
              <button
                id="heart-btn"
                onClick={() => toggleLike(currentSong.id)}
                className="text-white/40 hover:text-white transition-colors p-2 flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                <Heart
                  size={24}
                  className={(favorites || []).includes(currentSong.id) ? 'text-[#1ed760] fill-[#1ed760]' : ''}
                />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1 text-left hidden sm:flex">
              {currentSong.mood && (
                <span className="text-[9px] md:text-[10px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-950/40 border border-cyan-800/30 px-2.5 py-1 rounded-full">
                  Mood: {currentSong.mood}
                </span>
              )}
              {currentSong.album && (
                <span className="text-[9px] md:text-[10px] text-violet-400 font-bold uppercase tracking-wider bg-violet-950/40 border border-violet-800/30 px-2.5 py-1 rounded-full">
                  Album: {currentSong.album}
                </span>
              )}
            </div>
          </div>

          {/* Time Timeline / Seeker Slider */}
          <div className="w-full space-y-1.5 md:space-y-2 px-2 md:px-0 mt-4 md:mt-0">
            <input
              id="seeker-slider"
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={e => seek(parseFloat(e.target.value))}
              className="w-full accent-white cursor-pointer h-1 rounded-full bg-white/20 outline-none appearance-none transition-all duration-300 hover:h-1.5"
            />
            <div className="flex justify-between text-[11px] text-white/60 font-medium">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Playback Controls */}
          <div className="w-full flex items-center justify-between px-2 md:px-0 py-2">
            {/* Shuffle Toggle */}
            <div className="relative flex flex-col items-center">
              <button
                id="shuffle-btn"
                onClick={() => setIsShuffle(prev => !prev)}
                className={`p-2 transition-colors cursor-pointer ${
                  isShuffle ? 'text-[#1ed760]' : 'text-white/60 hover:text-white'
                }`}
              >
                <Shuffle size={20} />
              </button>
              {isShuffle && <div className="absolute -bottom-0.5 w-1 h-1 bg-[#1ed760] rounded-full" />}
            </div>

            {/* Skip Back */}
            <button
              id="prev-btn"
              onClick={playPrev}
              className="p-2 text-white hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <SkipBack size={32} fill="currentColor" />
            </button>

            {/* Play/Pause */}
            <button
              id="play-pause-btn"
              onClick={togglePlay}
              className="w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all bg-white text-black cursor-pointer shadow-xl"
            >
              {isPlaying 
                ? <Pause size={28} fill="#000" color="#000" /> 
                : <Play size={28} fill="#000" color="#000" className="ml-1" />
              }
            </button>

            {/* Skip Forward */}
            <button
              id="next-btn"
              onClick={playNext}
              className="p-2 text-white hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <SkipForward size={32} fill="currentColor" />
            </button>

            {/* Repeat Toggle */}
            <div className="relative flex flex-col items-center">
              <button
                id="repeat-btn"
                onClick={() => {
                  setRepeatMode(prev => {
                    if (prev === 'off') return 'all';
                    if (prev === 'all') return 'one';
                    return 'off';
                  });
                }}
                className={`p-2 transition-colors cursor-pointer ${
                  repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-white/60 hover:text-white'
                }`}
              >
                <Repeat size={20} />
                {repeatMode === 'one' && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#07070a] rounded-full text-[6px] text-[#1ed760] flex items-center justify-center font-bold">1</span>
                )}
              </button>
              {repeatMode !== 'off' && <div className="absolute -bottom-0.5 w-1 h-1 bg-[#1ed760] rounded-full" />}
            </div>
          </div>

          {/* Bottom Icons (Devices & Queue on mobile, Volume on desktop) */}
          <div className="w-full flex items-center justify-between px-2 md:px-0">
            <button className="text-white/50 hover:text-white transition-colors cursor-pointer p-2">
              <MonitorSpeaker size={20} />
            </button>

            {/* Desktop Volume Slider (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-3 flex-1 px-4">
              <button
                onClick={() => changeVolume(volume > 0 ? 0 : 0.8)}
                className="text-white/40 hover:text-white transition-colors"
              >
                {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                id="vol-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={e => changeVolume(parseFloat(e.target.value))}
                className="max-w-[150px] accent-white cursor-pointer h-1 rounded-full bg-white/20 outline-none appearance-none"
              />
            </div>

            <button 
              onClick={() => document.getElementById('up-next-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white/50 hover:text-white transition-colors cursor-pointer p-2 md:hidden"
            >
              <ListMusic size={20} />
            </button>
          </div>
        </div>

        {/* Right Column: Up Next Queue */}
        <div id="up-next-section" className="flex-1 flex-col justify-start max-w-md w-full mx-auto md:max-w-none border-t border-white/10 pt-8 md:pt-0 md:border-t-0 md:border-l md:border-white/5 md:pl-8 space-y-6 flex">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ListMusic size={18} className="text-[#1ed760]" />
              <h2 className="text-white text-lg font-bold tracking-tight">Up Next</h2>
            </div>

            <div className="flex flex-col gap-2 overflow-visible pr-1">
              {queue.length === 0 ? (
                <p className="text-white/40 text-sm italic">No upcoming songs</p>
              ) : (
                queue.map((song) => (
                  <div 
                    key={song.id}
                    onClick={() => playSong(song)}
                    className="group flex items-center gap-3 p-2 md:p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer active:scale-[0.98] border border-transparent hover:border-white/5"
                  >
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow flex-shrink-0 bg-white/5">
                      <img
                        src={albumCovers[song.id] || song.cover}
                        alt={song.title}
                        onError={(e) => {
                          if (song.fallbackCover && e.target.src !== song.fallbackCover) {
                            e.target.src = song.fallbackCover;
                          } else {
                            e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play size={10} fill="#fff" className="text-white ml-0.5" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-white text-xs font-bold truncate group-hover:text-cyan-300 transition-colors">{song.title}</h4>
                      <div className="text-white/40 text-[10px] mt-0.5 font-medium truncate flex items-center gap-1 w-full text-left">
                        {splitArtists(song.artist).map((artistName, i, arr) => (
                          <span key={artistName} className="truncate max-w-full">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (artistName && artistName !== 'Unknown Artist') {
                                  setActiveArtist(artistName);
                                  setActiveSection('artist');
                                }
                              }}
                              className="hover:text-white hover:underline transition-colors cursor-pointer"
                            >
                              {artistName}
                            </button>
                            {i < arr.length - 1 && <span>, </span>}
                          </span>
                        ))}
                      </div>
                    </div>
                    {song.mood && (
                      <div className="text-[10px] text-white/30 font-semibold px-2 py-0.5 bg-white/[0.03] rounded-md border border-white/5 capitalize">
                        {song.mood}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Related Selection Widget */}
          <div className="bg-gradient-to-tr from-cyan-950/20 to-violet-950/15 border border-cyan-500/10 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden group">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 bg-white/5">
              <img
                src={albumCovers[currentSong.id] || currentSong.cover}
                alt={currentSong.title}
                onError={(e) => {
                  if (currentSong.fallbackCover && e.target.src !== currentSong.fallbackCover) {
                    e.target.src = currentSong.fallbackCover;
                  } else {
                    e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
                  }
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <Sparkles size={16} className="text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-[8px] font-extrabold text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded-full uppercase tracking-wider">Related Selection</span>
              <p className="text-white text-xs font-bold truncate">Discover similar {currentSong.mood || 'vibe'} tracks</p>
              <button
                onClick={() => setActiveSection('home')}
                className="text-[10px] text-white/50 hover:text-white font-bold transition-colors underline decoration-dotted cursor-pointer"
              >
                Explore related on Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
