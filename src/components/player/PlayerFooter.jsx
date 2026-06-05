import { usePlayer } from '../../context/PlayerContext';
import { cleanTitle, moodAccent } from '../../utils/cleanTitle';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, X, Timer
} from 'lucide-react';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function Equalizer({ isPlaying }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`w-[3px] bg-cyan-400 rounded-full ${
            isPlaying
              ? i === 0 ? 'animate-equalize' : i === 1 ? 'animate-equalize-delayed-1' : 'animate-equalize-delayed-2'
              : 'h-1'
          }`}
          style={{ minHeight: '4px' }}
        />
      ))}
    </div>
  );
}
 
export default function PlayerFooter() {
  const {
    currentSong, isPlaying, progress, duration, volume,
    togglePlay, playNext, playPrev, seek, changeVolume,
    favorites = [], toggleLike, activeSection, setActiveSection, stopPlayback,
    sleepTimer, startSleepTimer, cancelSleepTimer, albumCovers = {},
  } = usePlayer();
 
  if (!currentSong || activeSection === 'now-playing') return null;
 
  const pct    = duration ? (progress / duration) * 100 : 0;
  const accent = moodAccent(currentSong.mood);
  const displayTitle = cleanTitle(currentSong.title);
 
  return (
    <div
      className="fixed left-0 right-0 md:left-5 md:right-5 z-50 rounded-none md:rounded-2xl border-t md:border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-5 md:!bottom-5"
      style={{
        bottom: 'calc(55px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(10, 10, 15, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/15 cursor-pointer group" onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        seek(ratio * duration);
      }}>
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-100 relative"
          style={{ width: `${pct}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md shadow-black/50" />
        </div>
      </div>
 
      <div className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 gap-3 md:gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div
            onClick={() => setActiveSection('now-playing')}
            className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer hover:opacity-95 group/info"
          >
            <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0 group bg-white/5">
              <img
                src={albumCovers[currentSong.id] || currentSong.cover}
                alt={currentSong.title}
                className="w-11 h-11 md:w-12 md:h-12 object-cover shadow-md transition-transform duration-500 group-hover/thumb:scale-105"
              />
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <Equalizer isPlaying={isPlaying} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs md:text-sm font-bold truncate group-hover/info:text-cyan-300 transition-colors">{displayTitle}</p>
              <p className="text-white/50 text-[10px] md:text-xs truncate mt-0.5 font-medium">{currentSong.artist}</p>
            </div>
          </div>
          <button
            onClick={() => toggleLike(currentSong.id)}
            className="text-white/50 hover:text-rose-500 transition-colors p-1.5 flex items-center justify-center cursor-pointer flex-shrink-0"
          >
            <Heart
              size={18}
              className={favorites.includes(currentSong.id) ? 'text-rose-500 fill-rose-500 scale-110' : 'text-white/40 hover:text-white'}
            />
          </button>
        </div>
 
        {/* Controls */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-3.5 md:gap-5">
            <button onClick={playPrev} className="hidden md:block text-white/60 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 p-1">
              <SkipBack size={18} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md flex-shrink-0`}
              style={{ background: `linear-gradient(135deg, ${accent.hex}, #a78bfa)` }}
            >
              {isPlaying
                ? <Pause className="w-4 h-4 md:w-[18px] md:h-[18px]" fill="#fff" color="#fff" />
                : <Play className="w-4 h-4 md:w-[18px] md:h-[18px] ml-0.5" fill="#fff" color="#fff" />
              }
            </button>
            <button onClick={playNext} className="text-white/60 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 p-1">
              <SkipForward className="w-4.5 h-4.5 md:w-[18px] md:h-[18px]" fill="currentColor" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/30 text-xs font-semibold">
            <span>{formatTime(progress)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
 
        {/* Volume */}
        <div className="hidden md:flex items-center gap-2.5 flex-1 justify-end">
          <button
            onClick={() => changeVolume(volume > 0 ? 0 : 0.8)}
            className="text-cyan-400/90 hover:text-cyan-300 transition-all duration-200 hover:scale-110 active:scale-95 p-1.5 flex items-center justify-center"
          >
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={e => changeVolume(parseFloat(e.target.value))}
            className="w-20 md:w-28 accent-cyan-400 cursor-pointer h-1 rounded-lg bg-white/10 outline-none appearance-none"
          />
        </div>

        {/* Sleep Timer indicator + Cancel button */}
        {sleepTimer !== null && (
          <div className="hidden md:flex items-center gap-1.5 text-amber-400 text-xs font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            <Timer size={12} />
            <span>{sleepTimer}m</span>
            <button onClick={cancelSleepTimer} className="text-amber-400/60 hover:text-amber-300 ml-0.5">
              <X size={10} />
            </button>
          </div>
        )}

        {/* Sleep timer quick-set (hidden on mobile) */}
        {sleepTimer === null && (
          <div className="hidden md:flex items-center relative group/sleep">
            <button
              className="text-white/20 hover:text-amber-400 transition-colors p-1.5 flex items-center justify-center"
              title="Sleep Timer"
              onClick={() => startSleepTimer(30)}
            >
              <Timer size={15} />
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover/sleep:flex flex-col gap-1 bg-[#0d0d12]/95 border border-white/10 rounded-xl p-2 shadow-2xl z-50 w-28">
              <p className="text-white/50 text-[9px] font-bold uppercase tracking-wider px-1 mb-0.5">Sleep Timer</p>
              {[15, 30, 45, 60].map(m => (
                <button key={m} onClick={() => startSleepTimer(m)}
                  className="text-white/70 hover:text-white text-xs font-semibold px-2 py-1 rounded-lg hover:bg-white/[0.06] text-left transition-colors">
                  {m} min
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Close/Cancel Button */}
        <button
          onClick={stopPlayback}
          className="text-white/40 hover:text-rose-500 transition-colors p-1.5 flex items-center justify-center cursor-pointer flex-shrink-0 hover:bg-white/5 active:scale-90 rounded-full"
          title="Close Player"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
