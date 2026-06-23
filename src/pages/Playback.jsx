import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { cleanTitle, moodAccent, splitArtists } from '../utils/cleanTitle';
import { useSwipe } from '../hooks/useGestures';
import { toast } from '../components/ui/Toast';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart,
  ChevronLeft, Volume2, VolumeX, ListMusic, Sparkles, Share2, MonitorSpeaker, Mic2, Loader2
} from 'lucide-react';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const visualizerBars = [...Array(30)].map((_, i) => ({
  id: i,
  height: `${Math.random() * 40 + 10}%`,
  animationDuration: `${Math.random() * 0.8 + 0.4}s`
}));

export default function Playback() {
  const {
    currentSong, isPlaying, progress, duration, volume,
    allSongs = [], favorites = [], isShuffle, setIsShuffle,
    repeatMode, setRepeatMode, playSong, togglePlay, playNext,
    playPrev, seek, changeVolume, toggleLike, setActiveSection, albumCovers = {}, setActiveArtist,
    upNextQueue, lyricsData, lyricsLoading, lyricsError
  } = usePlayer() || {};

  const accent = moodAccent(currentSong?.mood);
  const displayTitle = cleanTitle(currentSong?.title || '');

  // ─── Algorithmic Zen Mode (Context-Aware) ─────────────────────────────────
  const [isIdle, setIsIdle] = useState(false);
  
  useEffect(() => {
    let idleTimer;
    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsIdle(true), 4000);
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('keydown', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    resetIdle(); // init

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
      clearTimeout(idleTimer);
    };
  }, []);
  // ──────────────────────────────────────────────────────────────────────────

  // ─── Lyrics Engine ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'lyrics'
  const lyricsContainerRef = useRef(null);
  const activeLyricRef = useRef(null);

  const activeLyricIndex = useMemo(() => {
    if (!lyricsData || lyricsData.length === 0) return -1;
    return lyricsData.findIndex((line, idx) => {
      return progress >= line.time && (idx === lyricsData.length - 1 || progress < lyricsData[idx + 1].time);
    });
  }, [progress, lyricsData]);

  useEffect(() => {
    const doScroll = () => {
      if (activeLyricRef.current && activeTab === 'lyrics' && !isIdle) {
        setTimeout(() => {
          activeLyricRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };
    
    doScroll();
    window.addEventListener('resize', doScroll);
    return () => window.removeEventListener('resize', doScroll);
  }, [activeLyricIndex, activeTab, isIdle]);

  useEffect(() => {
    if (activeTab === 'lyrics' && lyricsContainerRef.current && lyricsData.length > 0) {
      const activeIdx = lyricsData.reduce((acc, curr, idx) => {
        return progress >= curr.time ? idx : acc;
      }, -1);
      
      if (activeIdx !== -1) {
        const lineEl = lyricsContainerRef.current.children[activeIdx];
        if (lineEl) {
          lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [progress, activeTab, lyricsData]);
  // ──────────────────────────────────────────────────────────────────────────

  const swipeHandlers = useSwipe({
    onSwipeLeft:  () => playNext?.(),
    onSwipeRight: () => playPrev?.(),
    onSwipeDown:  () => setActiveSection('home'),
    threshold: 60,
  });

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

  const queue = upNextQueue || [];

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


  return (
    <div className="relative min-h-[100dvh] md:min-h-[calc(100vh-140px)] w-full flex flex-col p-4 md:p-8 overflow-y-auto md:overflow-hidden">
      
      {/* Massive Cinematic Blurry Background based on Album Art */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <div
          className="absolute inset-[-20%] bg-cover bg-center transition-all duration-[2000ms] opacity-50 transform-gpu will-change-transform"
          style={{ backgroundImage: `url(${albumCovers[currentSong.id] || currentSong.cover})`, filter: 'blur(60px) saturate(2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#07070a]" />
        
        <div 
          className="absolute inset-0 opacity-15 transition-colors duration-1000 transform-gpu"
          style={{ background: `radial-gradient(circle at 50% 50%, ${accent.hex}, transparent 70%)` }}
        />
      </div>

      <div className={`relative z-10 w-full min-h-[calc(100dvh-2rem)] md:h-full max-w-5xl mx-auto md:my-auto md:bg-white/[0.02] md:border md:border-white/5 md:backdrop-blur-2xl md:rounded-3xl md:p-10 flex flex-col md:flex-row gap-6 md:gap-12 shadow-none md:shadow-2xl overflow-visible md:overflow-hidden`}>
        
        <div 
          className="flex-shrink-0 flex flex-col items-center md:items-start text-center md:text-left justify-between space-y-2 md:space-y-6 w-full max-w-md mx-auto md:max-w-none md:flex-1"
          {...swipeHandlers}
        >
          <div className="w-full flex items-center justify-between">
            <button
              onClick={() => setActiveSection('home')}
              className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-semibold cursor-pointer pb-2 border-b border-transparent hover:border-white/15"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-white/40 hover:text-cyan-400 transition-colors text-xs font-semibold cursor-pointer p-2 rounded-xl hover:bg-white/5"
            >
              <Share2 size={15} />
            </button>
          </div>

          <div className="relative w-full aspect-square max-h-[35vh] md:max-h-none max-w-[280px] md:max-w-md mx-auto rounded-3xl md:rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group mt-2 mb-2 md:mt-0 md:mb-0">
            <img
              src={albumCovers[currentSong.id] || currentSong.cover}
              alt={currentSong.title}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500'; }}
              className={`w-full h-full object-cover transition-transform duration-700 ${isIdle ? 'scale-100' : 'group-hover:scale-105'}`}
            />
            <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isPlaying && !isIdle ? 'animate-pulse' : ''}`} />
          </div>

          <div className="w-full transition-all duration-700">
            <div className="w-full space-y-1.5 md:space-y-2 px-2 md:px-0">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1 text-left">
                  <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight truncate">{displayTitle}</h1>
                  <div className="text-white/50 text-xs sm:text-sm md:text-base font-semibold mt-0.5 md:mt-1 truncate">
                    {currentSong.artist}
                  </div>
                </div>
                <button
                  onClick={() => toggleLike(currentSong.id)}
                  className="text-white/40 hover:text-white transition-colors p-2"
                >
                  <Heart size={24} className={(favorites || []).includes(currentSong.id) ? 'text-[#1ed760] fill-[#1ed760]' : ''} />
                </button>
              </div>
            </div>

            <div className="w-full space-y-1.5 md:space-y-2 px-2 md:px-0 mt-4 md:mt-0">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={e => seek(parseFloat(e.target.value))}
                className="w-full accent-white cursor-pointer h-1 rounded-full bg-white/20 outline-none appearance-none"
              />
              <div className="flex justify-between text-[11px] text-white/60 font-medium">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="w-full flex items-center justify-between px-2 md:px-0 py-2">
              <button onClick={() => setIsShuffle(prev => !prev)} className={`p-2 ${isShuffle ? 'text-[#1ed760]' : 'text-white/60'}`}><Shuffle size={20} /></button>
              <button onClick={playPrev} className="p-2 text-white"><SkipBack size={32} fill="currentColor" /></button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-black shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${accent.hex}, #fff)`, boxShadow: `0 0 30px ${accent.hex}40` }}
              >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
              </button>
              <button onClick={playNext} className="p-2 text-white"><SkipForward size={32} fill="currentColor" /></button>
              <button onClick={() => setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off')} className={`p-2 ${repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-white/60'}`}><Repeat size={20} /></button>
            </div>
          </div>
        </div>

        <div id="up-next-section" className="flex-1 grid grid-rows-[auto_1fr_auto] bg-black/20 md:bg-white/[0.02] md:border-l border-white/5 rounded-3xl md:rounded-none relative mt-2 md:mt-0 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] md:shadow-none md:min-h-0 md:overflow-hidden">
          <div className={`absolute inset-0 pointer-events-none flex items-end justify-center gap-1 opacity-20 transition-opacity duration-1000 ${isPlaying && !isIdle ? 'opacity-30' : 'opacity-0'}`}>
            {visualizerBars.map((bar) => (
              <div 
                key={bar.id} 
                className="w-2 rounded-t-full"
                style={{
                  backgroundColor: accent.hex,
                  height: bar.height,
                  animation: `equalize ${bar.animationDuration} ease-in-out infinite alternate`,
                  animationPlayState: isPlaying ? 'running' : 'paused'
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex border-b border-white/5 p-2 transition-opacity duration-700">
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-xl ${activeTab === 'queue' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
            >
              Queue
            </button>
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-xl ${activeTab === 'lyrics' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
            >
              Lyrics
            </button>
          </div>

          <div className="md:overflow-y-auto relative z-0 md:min-h-0 scrollbar-hide transform-gpu md:![clip-path:inset(0)]">
            {activeTab === 'queue' && (
              <div className="flex flex-col gap-2 p-4 min-h-full">
                {/* Now Playing Header */}
                <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest pl-2 mb-1">Now Playing</div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/10 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 pointer-events-none" />
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                    <img src={currentSong.cover} className="w-full h-full object-cover" />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                        <div className="w-1 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 z-10">
                    <h4 className="text-white text-sm font-extrabold truncate">{currentSong.title}</h4>
                    <p className="text-white/60 text-xs font-semibold truncate">{currentSong.artist}</p>
                  </div>
                  <div className="z-10 text-cyan-400 pr-2">
                    <Sparkles size={18} />
                  </div>
                </div>

                {/* Up Next Header */}
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2 mt-4 mb-1">Up Next</div>
                
                {queue.length > 0 ? (
                  queue.slice(0, 50).map((song, index) => (
                    <div key={song.id + '-' + index} onClick={() => playSong(song)} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/5 cursor-pointer group transition-all duration-300">
                      <div className="text-white/20 text-xs font-bold w-4 text-center group-hover:text-cyan-400 transition-colors">
                        {index + 1}
                      </div>
                      <img src={song.cover} className="w-10 h-10 rounded-lg object-cover shadow-md group-hover:scale-105 transition-transform" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-white/90 text-sm font-bold truncate group-hover:text-white transition-colors">{song.title}</h4>
                        <p className="text-white/40 text-[11px] font-semibold truncate">{song.artist}</p>
                      </div>
                      {song.duration && (
                        <div className="text-white/30 text-[10px] font-bold pr-2">
                          {formatTime(song.duration)}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    <p className="text-white/50 text-sm font-medium">Generating Smart Radio Queue...</p>
                  </div>
                )}
                
                {queue.length >= 50 && (
                  <div className="text-center pt-6 pb-20">
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                      <ListMusic size={14} />
                      Infinite Radio Engine Active
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'lyrics' && (
              <div className="w-full p-4 md:p-8 relative">
                {lyricsLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 transition-opacity duration-700">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    <p className="text-white/50 text-sm font-medium">Extracting lyrics algorithmically...</p>
                  </div>
                ) : lyricsError ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 transition-opacity duration-700">
                    <p className="text-white/40 text-sm font-medium">{lyricsError}</p>
                  </div>
                ) : lyricsData.length > 0 ? (
                    <div ref={lyricsContainerRef} className="space-y-6 md:space-y-8 pb-[60vh] pt-[10vh] transition-all duration-1000">
                      {lyricsData.map((line, idx) => {
                        const isActive = progress >= line.time && (idx === lyricsData.length - 1 || progress < lyricsData[idx + 1].time);
                        const isPast = progress > line.time;
                        return (
                          <div
                            key={idx}
                            ref={isActive ? activeLyricRef : null}
                            className={`transition-all duration-500 cursor-pointer ${isActive ? 'text-2xl md:text-4xl font-extrabold text-white transform scale-105' : isPast ? 'text-xl md:text-2xl font-bold text-white/30 blur-[1px]' : 'text-xl md:text-2xl font-bold text-white/50'}`}
                            style={isActive ? { textShadow: `0 0 30px ${accent.hex}80` } : {}}
                            onClick={() => seek(line.time)}
                          >
                            {line.text}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

          {/* Related Selection Widget */}
          <div className="shrink-0 mt-auto bg-gradient-to-tr from-cyan-950/20 to-violet-950/15 border border-cyan-500/10 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden group">
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
