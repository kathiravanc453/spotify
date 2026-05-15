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
      className={`group relative flex flex-col gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300
        ${isActive
          ? 'bg-spotify-green/10 border border-spotify-green/30 shadow-lg shadow-spotify-green/10'
          : 'bg-spotify-dark hover:bg-spotify-light border border-transparent hover:border-white/10 hover:shadow-xl hover:shadow-black/30'
        }
        hover:-translate-y-1`}
    >
      {/* Cover */}
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay play button */}
        <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-200
          ${isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xl transition-all duration-200
            ${isCurrentlyPlaying ? 'bg-spotify-green scale-100' : 'bg-spotify-green scale-90 group-hover:scale-100'}`}>
            {isCurrentlyPlaying
              ? <Pause size={18} fill="#000" color="#000" />
              : <Play size={18} fill="#000" color="#000" className="ml-0.5" />
            }
          </div>
        </div>

        {/* Active glow */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl ring-2 ring-spotify-green/50 pointer-events-none" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <p className={`font-semibold text-sm truncate ${isActive ? 'text-spotify-green' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-white/50 text-xs truncate mt-0.5">{song.artist}</p>
        <p className="text-white/25 text-xs mt-1">{formatTime(song.duration)}</p>
      </div>
    </div>
  );
}
