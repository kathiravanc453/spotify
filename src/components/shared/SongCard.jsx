import { Play, Pause } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function SongCard({ song }) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const isCurrentlyPlaying = isActive && isPlaying;

  return (
    <div
      id={`song-card-${song.id}`}
      onClick={() => playSong(song)}
      className={`group relative flex flex-col gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-500
        ${isActive
          ? 'bg-gradient-to-b from-cyan-500/10 to-violet-500/5 border border-cyan-400/30 shadow-lg shadow-cyan-500/5 scale-[1.02]'
          : 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/12 hover:shadow-2xl hover:shadow-black/40'
        }
        hover:-translate-y-1`}
    >
      {/* Cover */}
      <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
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
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Overlay play button */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300
          ${isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
            ${isCurrentlyPlaying 
              ? 'bg-gradient-to-tr from-cyan-400 to-violet-500 scale-100 shadow-cyan-500/20' 
              : 'bg-gradient-to-tr from-cyan-400 to-violet-500 scale-90 group-hover:scale-100 hover:scale-105'}`}>
            {isCurrentlyPlaying
              ? <Pause size={18} fill="#fff" color="#fff" />
              : <Play size={18} fill="#fff" color="#fff" className="ml-0.5" />
            }
          </div>
        </div>
 
        {/* Active glow */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl ring-1 ring-cyan-400/50 pointer-events-none" />
        )}
      </div>
 
      {/* Info */}
      <div className="min-w-0 px-0.5">
        <p className={`font-bold text-sm truncate transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-white/50 text-xs truncate mt-0.5 font-medium">{song.artist}</p>
        <p className="text-white/20 text-xs mt-1.5 font-semibold">{formatTime(song.duration)}</p>
      </div>
    </div>
  );
}
