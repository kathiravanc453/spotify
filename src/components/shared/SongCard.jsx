import { useState, memo } from 'react';
import { Play, Pause, MoreVertical } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { cleanTitle, moodAccent, splitArtists } from '../../utils/cleanTitle';
import { useLongPress } from '../../hooks/useGestures';
import SongContextSheet from '../ui/SongContextSheet';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function Equalizer() {
  return (
    <div className="flex items-end gap-[2.5px] h-4">
      {[0,1,2].map(i => (
        <div
          key={i}
          className={`w-[3px] rounded-full bg-cyan-400 ${
            i === 0 ? 'animate-equalize'
            : i === 1 ? 'animate-equalize-delayed-1'
            : 'animate-equalize-delayed-2'
          }`}
          style={{ minHeight: '4px' }}
        />
      ))}
    </div>
  );
}

export default memo(function SongCard({ song, songsList = [] }) {
  const { currentSong, isPlaying, playSong, progress, duration, playCounts = {}, albumCovers = {}, setActiveArtist, setActiveSection, openPlaylistModal } = usePlayer();
  const [showContext, setShowContext] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const isActive = currentSong?.id === song.id;
  const isCurrentlyPlaying = isActive && isPlaying;
  const accent = moodAccent(song.mood);
  const displayTitle = cleanTitle(song.title);

  const timeToShow = isCurrentlyPlaying ? progress : (isActive && duration ? duration : song.duration);
  const playCount = playCounts[song.id] || 0;
  const realCover = albumCovers[song.id] || song.cover;

  const longPressHandlers = useLongPress(() => setShowContext(true), 500);

  return (
    <>
      <div
        id={`song-card-${song.id}`}
        onClick={() => playSong(song, { initialQueue: songsList })}
        {...longPressHandlers}
        className={`group relative flex items-center gap-4 p-3 pr-6 rounded-[24px] cursor-pointer transition-all duration-300 select-none ${isActive ? 'bg-white/[0.08] border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.15)] scale-[1.02]' : 'bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/10 hover:scale-[1.01]'}`}
      >
        <div className="relative w-16 h-16 flex-shrink-0">
          {/* Vinyl Record that slides out on hover */}
          <div className={`absolute inset-0 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-500 ${isCurrentlyPlaying ? 'translate-x-6 rotate-180 animate-[spin_4s_linear_infinite]' : 'group-hover:translate-x-6 group-hover:rotate-180'}`}>
            <div className={`w-6 h-6 rounded-full border border-[#222] ${isCurrentlyPlaying ? 'bg-gradient-to-tr from-cyan-400 to-violet-500' : 'bg-[#111]'}`} />
          </div>
          
          {/* Album Sleeve */}
          <div className="absolute inset-0 z-10 rounded-xl overflow-hidden shadow-lg">
            {!imgLoaded && <div className="absolute inset-0 shimmer rounded-xl" />}
            <img
              src={realCover}
              alt={song.title}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                setImgLoaded(true);
                e.target.src = song.fallbackCover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
              }}
              className={`w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* Play/Pause Overlay */}
            <div className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity duration-300 ${isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 scale-90 group-hover:scale-100`}
                style={{ background: `linear-gradient(135deg, ${accent.hex}, #a78bfa)` }}
              >
                {isCurrentlyPlaying ? <Equalizer /> : <Play size={14} fill="#fff" color="#fff" className="ml-0.5" />}
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/20 md:hidden" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 z-10 pl-4 py-1">
          <h3 className={`font-bold truncate text-base ${isActive ? 'text-cyan-400' : 'text-white/90 group-hover:text-white'}`}>
            {displayTitle}
          </h3>
          <div className="text-white/50 group-hover:text-white/70 text-sm truncate mt-0.5 transition-colors flex items-center gap-1">
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

        {/* Right side stats/actions */}
        <div className="flex items-center gap-4 z-10">
          {playCount > 0 && (
            <span className="hidden sm:block text-[10px] font-bold text-white/30 uppercase tracking-widest">
              {playCount} plays
            </span>
          )}
          <span className="text-white/40 text-xs font-medium font-mono">
            {formatTime(timeToShow)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowContext(true);
            }}
            className="text-white/30 hover:text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all p-1 md:block"
            title="More options"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {showContext && (
        <SongContextSheet song={song} onClose={() => setShowContext(false)} />
      )}
    </>
  );
});
