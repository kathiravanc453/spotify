import { useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart,
  ChevronLeft, Volume2, VolumeX, ListMusic, Sparkles
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
    playPrev, seek, changeVolume, toggleLike, setActiveSection
  } = usePlayer() || {};

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

  // Get upcoming songs to show in "Up Next" queue
  const queue = useMemo(() => {
    if (!currentSong || allSongs.length === 0) return [];
    const idx = allSongs.findIndex(s => s.id === currentSong.id);
    if (idx === -1) return allSongs.slice(0, 5);
    
    // We display the next 5 songs in order.
    const upcoming = [];
    for (let i = 1; i <= 5; i++) {
      const nextIdx = (idx + i) % allSongs.length;
      if (allSongs[nextIdx] && allSongs[nextIdx].id !== currentSong.id) {
        upcoming.push(allSongs[nextIdx]);
      }
    }
    return upcoming;
  }, [currentSong, allSongs]);

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Blurred background cover art */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-[100px] opacity-[0.18] scale-150 transition-all duration-1000"
          style={{ backgroundImage: `url(${currentSong.cover})` }}
        />
        <div className="absolute inset-0 bg-[#07070a]/90" />
      </div>

      <div className="relative z-10 w-full max-w-5xl bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-3xl p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 shadow-2xl">
        {/* Left Column: Playing Song Card Controls */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left justify-between space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setActiveSection('home')}
            className="self-start flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-semibold cursor-pointer pb-2 border-b border-transparent hover:border-white/15"
          >
            <ChevronLeft size={16} />
            Back to Dashboard
          </button>

          {/* Album Art container with shadow & glow */}
          <div className="relative group w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/10 mx-auto md:mx-0 flex-shrink-0 animate-in zoom-in-95 duration-500">
            <img
              src={currentSong.cover}
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
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 text-left">
                <h1 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight truncate">{currentSong.title}</h1>
                <p className="text-white/50 text-sm md:text-base font-semibold mt-1 truncate">{currentSong.artist}</p>
              </div>
              <button
                id="heart-btn"
                onClick={() => toggleLike(currentSong.id)}
                className="text-white/40 hover:text-rose-500 transition-colors p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                <Heart
                  size={20}
                  className={favorites.includes(currentSong.id) ? 'text-rose-500 fill-rose-500 scale-110' : ''}
                />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1 text-left">
              {currentSong.mood && (
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-950/40 border border-cyan-800/30 px-3 py-1 rounded-full">
                  Mood: {currentSong.mood}
                </span>
              )}
              {currentSong.album && (
                <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider bg-violet-950/40 border border-violet-800/30 px-3 py-1 rounded-full">
                  Album: {currentSong.album}
                </span>
              )}
            </div>
          </div>

          {/* Time Timeline / Seeker Slider */}
          <div className="w-full space-y-2">
            <input
              id="seeker-slider"
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={e => seek(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 rounded-lg bg-white/10 outline-none appearance-none transition-all duration-300 hover:h-2"
            />
            <div className="flex justify-between text-[11px] text-white/40 font-semibold">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Playback Controls */}
          <div className="w-full flex items-center justify-between px-4 md:px-0">
            {/* Shuffle Toggle */}
            <button
              id="shuffle-btn"
              onClick={() => setIsShuffle(prev => !prev)}
              className={`p-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
                isShuffle 
                  ? 'text-cyan-400 bg-cyan-950/30 border border-cyan-500/15 shadow shadow-cyan-500/10' 
                  : 'text-white/30 hover:text-white bg-transparent border border-transparent'
              }`}
            >
              <Shuffle size={18} />
            </button>

            {/* Skip Back */}
            <button
              id="prev-btn"
              onClick={playPrev}
              className="p-2.5 rounded-xl text-white/60 hover:text-white transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <SkipBack size={22} fill="currentColor" />
            </button>

            {/* Play/Pause */}
            <button
              id="play-pause-btn"
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 text-white cursor-pointer"
            >
              {isPlaying 
                ? <Pause size={24} fill="#fff" color="#fff" /> 
                : <Play size={24} fill="#fff" color="#fff" className="ml-1" />
              }
            </button>

            {/* Skip Forward */}
            <button
              id="next-btn"
              onClick={playNext}
              className="p-2.5 rounded-xl text-white/60 hover:text-white transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>

            {/* Repeat Toggle */}
            <button
              id="repeat-btn"
              onClick={() => {
                setRepeatMode(prev => {
                  if (prev === 'off') return 'all';
                  if (prev === 'all') return 'one';
                  return 'off';
                });
              }}
              className={`relative p-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
                repeatMode !== 'off' 
                  ? 'text-violet-400 bg-violet-950/30 border border-violet-500/15 shadow shadow-violet-500/10' 
                  : 'text-white/30 hover:text-white bg-transparent border border-transparent'
              }`}
            >
              <Repeat size={18} />
              {repeatMode === 'one' && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-violet-500 rounded-full text-[7px] text-white flex items-center justify-center font-bold">1</span>
              )}
            </button>
          </div>

          {/* Volume Control */}
          <div className="w-full flex items-center gap-3">
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
              className="flex-1 accent-cyan-400 cursor-pointer h-1 rounded-lg bg-white/10 outline-none appearance-none"
            />
          </div>
        </div>

        {/* Right Column: Up Next Queue */}
        <div className="flex-1 flex flex-col justify-between max-w-md w-full border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ListMusic size={18} className="text-cyan-400" />
              <h2 className="text-white text-lg font-bold tracking-tight">Up Next</h2>
            </div>

            <div className="flex flex-col gap-2 max-h-[300px] md:max-h-[380px] overflow-y-auto pr-1 scrollbar-none">
              {queue.length === 0 ? (
                <p className="text-white/30 text-xs font-semibold py-8 text-center bg-white/[0.01] rounded-2xl border border-white/5">Queue is empty</p>
              ) : (
                queue.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song)}
                    className="group flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/[0.04] transition-all duration-300 border border-transparent hover:border-white/5 cursor-pointer"
                  >
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow flex-shrink-0">
                      <img
                        src={song.cover}
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
                      <p className="text-white/40 text-[10px] mt-0.5 font-medium truncate">{song.artist}</p>
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
          <div className="bg-gradient-to-tr from-cyan-950/20 to-violet-950/15 border border-cyan-500/10 rounded-3xl p-4 md:p-5 flex items-center gap-4 relative overflow-hidden group">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
              <img
                src={currentSong.cover}
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
