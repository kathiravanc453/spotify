import { Play, Pause, Clock3, Heart } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function SongRow({ song, index }) {
  const { currentSong, isPlaying, playSong, favorites = [], toggleLike } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const isCurrentlyPlaying = isActive && isPlaying;

  return (
    <div
      onClick={() => playSong(song)}
      className={`group flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 border
        ${isActive
          ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/5 border-cyan-500/20'
          : 'hover:bg-white/[0.03] border-transparent'
        }`}
    >
      {/* Index / play icon */}
      <div className="w-6 text-center flex-shrink-0">
        {isCurrentlyPlaying ? (
          <Pause size={14} className="text-cyan-400 mx-auto" />
        ) : (
          <>
            <span className={`text-xs font-semibold ${isActive ? 'text-cyan-400' : 'text-white/30'} group-hover:hidden`}>
              {index + 1}
            </span>
            <Play size={14} className="text-white mx-auto hidden group-hover:block" />
          </>
        )}
      </div>
 
      {/* Cover thumbnail */}
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
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow"
      />
 
      {/* Title & artist */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-white/40 text-xs truncate mt-0.5 font-medium">{song.artist}</p>
      </div>
 
      {/* Album */}
      <p className="hidden md:block text-white/30 text-xs flex-shrink-0 w-36 truncate font-medium">{song.album}</p>
 
      {/* Heart/Like Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent playing song when clicking Heart icon
          toggleLike(song.id);
        }}
        className="text-white/20 hover:text-rose-500 transition-colors p-1.5 flex items-center justify-center cursor-pointer flex-shrink-0"
      >
        <Heart
          size={14}
          className={favorites.includes(song.id) ? 'text-rose-500 fill-rose-500 scale-110' : 'opacity-0 group-hover:opacity-100 text-white/30 hover:text-white'}
        />
      </button>

      {/* Duration */}
      <p className="text-white/30 text-xs flex-shrink-0 flex items-center gap-1.5 font-semibold">
        <Clock3 size={11} className="text-white/20" />
        {formatTime(song.duration)}
      </p>
    </div>
  );
}
