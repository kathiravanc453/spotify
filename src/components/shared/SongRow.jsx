import { Play, Pause, Clock3 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function SongRow({ song, index }) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const isActive = currentSong?.id === song.id;
  const isCurrentlyPlaying = isActive && isPlaying;

  return (
    <div
      onClick={() => playSong(song)}
      className={`group flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
        ${isActive
          ? 'bg-spotify-green/10 border border-spotify-green/20'
          : 'hover:bg-white/5 border border-transparent'
        }`}
    >
      {/* Index / play icon */}
      <div className="w-6 text-center flex-shrink-0">
        {isCurrentlyPlaying ? (
          <Pause size={14} className="text-spotify-green mx-auto" />
        ) : (
          <>
            <span className={`text-xs ${isActive ? 'text-spotify-green' : 'text-white/40'} group-hover:hidden`}>
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
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
      />

      {/* Title & artist */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-spotify-green' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-white/40 text-xs truncate">{song.artist}</p>
      </div>

      {/* Album */}
      <p className="hidden md:block text-white/30 text-xs flex-shrink-0 w-36 truncate">{song.album}</p>

      {/* Duration */}
      <p className="text-white/30 text-xs flex-shrink-0 flex items-center gap-1">
        <Clock3 size={11} />
        {formatTime(song.duration)}
      </p>
    </div>
  );
}
