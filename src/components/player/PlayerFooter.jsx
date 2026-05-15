import { usePlayer } from '../../context/PlayerContext';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX
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
          className={`w-[3px] bg-spotify-green rounded-full ${
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
  const { currentSong, isPlaying, progress, duration, volume, togglePlay, playNext, playPrev, seek, changeVolume } = usePlayer();

  if (!currentSong) return null;

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 glassmorphism border-t border-white/10"
      style={{
        background: 'rgba(15,15,15,0.85)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/10 cursor-pointer group" onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        seek(ratio * duration);
      }}>
        <div
          className="h-full bg-spotify-green transition-all duration-100 relative"
          style={{ width: `${pct}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative">
            <img
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-12 h-12 rounded-lg object-cover shadow-lg flex-shrink-0"
            />
            <div className="absolute inset-0 rounded-lg bg-black/20 flex items-center justify-center">
              <Equalizer isPlaying={isPlaying} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{currentSong.title}</p>
            <p className="text-white/50 text-xs truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={playPrev} className="text-white/60 hover:text-white transition-colors p-1">
              <SkipBack size={18} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg neon-glow"
            >
              {isPlaying
                ? <Pause size={18} fill="#000" color="#000" />
                : <Play size={18} fill="#000" color="#000" className="ml-0.5" />
              }
            </button>
            <button onClick={playNext} className="text-white/60 hover:text-white transition-colors p-1">
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span>{formatTime(progress)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={() => changeVolume(volume > 0 ? 0 : 0.8)}
            className="text-white/60 hover:text-white transition-colors"
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
            className="w-20 md:w-28 accent-spotify-green cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
