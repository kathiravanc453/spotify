import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
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

export default function SongCard({ song }) {
  const { currentSong, isPlaying, playSong, progress, duration, playCounts = {}, albumCovers = {}, setActiveArtist, setActiveSection } = usePlayer();
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
        onClick={() => playSong(song)}
        {...longPressHandlers}
        className={`ripple-container stagger-item group relative flex flex-col gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-500 select-none card-hover-lift
          ${isActive
            ? `bg-gradient-to-b from-cyan-500/12 to-violet-500/6 border border-cyan-400/30 shadow-lg shadow-cyan-500/10 ${isCurrentlyPlaying ? 'active-glow' : ''}`
            : 'bg-white/[0.025] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15'
          }`}
      >
        {/* Cover with shimmer skeleton */}
        <div className="relative aspect-square rounded-xl overflow-hidden shadow-md">
          {/* Shimmer shown while image is loading */}
          {!imgLoaded && (
            <div className="absolute inset-0 shimmer rounded-xl" />
          )}

          <img
            src={realCover}
            alt={song.title}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              setImgLoaded(true);
              if (song.fallbackCover && e.target.src !== song.fallbackCover) {
                e.target.src = song.fallbackCover;
              } else {
                e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
              }
            }}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            } ${isCurrentlyPlaying ? 'animate-float' : ''}`}
          />

          {/* Play/Pause overlay */}
          <div className={`absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity duration-300
            ${isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300
                ${isCurrentlyPlaying ? 'scale-100' : 'scale-90 group-hover:scale-100 hover:scale-110'}`}
              style={{ background: `linear-gradient(135deg, ${accent.hex}, #a78bfa)` }}
            >
              {isCurrentlyPlaying
                ? <Equalizer />
                : <Play size={16} fill="#fff" color="#fff" className="ml-0.5" />
              }
            </div>
          </div>

          {/* Active glow ring */}
          {isActive && (
            <div className={`absolute inset-0 rounded-xl ring-1 ${accent.border} pointer-events-none`} />
          )}

          {/* Long-press hint dot */}
          <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/20 md:hidden" />
        </div>

        {/* Info */}
        <div className="min-w-0 px-0.5">
          <p className={`font-bold text-sm truncate transition-colors duration-300 ${isActive ? accent.text : 'text-white'}`}>
            {displayTitle}
          </p>
          <div className="text-white/45 text-xs truncate mt-0.5 font-medium w-full text-left flex items-center gap-1">
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
          <div className="flex items-center justify-between mt-1.5 flex-shrink-0">
            <p className="text-white/25 text-[10px] sm:text-xs font-semibold tracking-wider flex items-center gap-1 min-w-[36px]">
              {isCurrentlyPlaying && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mr-0.5" />}
              {formatTime(timeToShow)}
            </p>
            {playCount > 0 && (
              <span className="text-[9px] text-white/20 font-bold">{playCount} plays</span>
            )}
          </div>
        </div>
      </div>

      {showContext && (
        <SongContextSheet song={song} onClose={() => setShowContext(false)} />
      )}
    </>
  );
}
