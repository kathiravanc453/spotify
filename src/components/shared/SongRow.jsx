import { Play, Pause, Clock3, Heart, MoreVertical, Trash2 } from 'lucide-react';
import { useState, memo } from 'react';
import SongContextSheet from '../ui/SongContextSheet';
import { usePlayer } from '../../context/PlayerContext';
import { cleanTitle, splitArtists } from '../../utils/cleanTitle';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default memo(function SongRow({ song, index, songsList = [] }) {
  const { currentSong, isPlaying, playSong, favorites = [], toggleLike, progress, duration, albumCovers = {}, setActiveArtist, setActiveSection, openPlaylistModal, removeSongFromPlaylist, activeSection } = usePlayer();
  const [showContext, setShowContext] = useState(false);
  const isActive = currentSong?.id === song.id;
  const isCurrentlyPlaying = isActive && isPlaying;
  const displayTitle = cleanTitle(song.title);
  
  const isPlaylistView = activeSection?.startsWith('playlist_');
  const currentPlaylistId = isPlaylistView ? activeSection.split('playlist_')[1] : null;
  
  // Show live progress if playing, otherwise show total duration (use live duration if active, fallback to metadata)
  const timeToShow = isCurrentlyPlaying ? progress : (isActive && duration ? duration : song.duration);

  return (
    <div
      onClick={() => playSong(song, { initialQueue: songsList })}
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
        src={albumCovers[song.id] || song.cover}
        alt={song.title}
        loading="lazy"
        decoding="async"
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
          {displayTitle}
        </p>
        <div className="text-white/40 text-xs truncate mt-0.5 font-medium w-full text-left flex items-center gap-1">
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
          className={`transition-all duration-300 ${favorites.includes(song.id) ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]' : ''}`}
        />
      </button>

      {/* 3-dots Context Menu Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowContext(true);
        }}
        className="text-white/20 hover:text-white transition-colors p-1.5 flex items-center justify-center cursor-pointer flex-shrink-0"
        title="More options"
      >
        <MoreVertical size={16} />
      </button>

      {/* Remove from Playlist Button (Only visible in Playlist View) */}
      {isPlaylistView && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Remove this song from the playlist?')) {
              removeSongFromPlaylist(currentPlaylistId, song.id);
            }
          }}
          className="text-white/20 hover:text-rose-500 transition-colors p-1.5 flex items-center justify-center cursor-pointer flex-shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100"
          title="Remove from Playlist"
        >
          <Trash2 size={16} />
        </button>
      )}


      {/* Duration / Live Progress */}
      {(timeToShow > 0 || isCurrentlyPlaying) && (
        <p className="text-white/30 text-xs flex-shrink-0 flex items-center gap-1.5 font-semibold w-12 justify-end">
          {!isCurrentlyPlaying && <Clock3 size={11} className="text-white/20" />}
          {isCurrentlyPlaying && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mr-0.5"></span>}
          {formatTime(timeToShow)}
        </p>
      )}

      {showContext && (
        <SongContextSheet song={song} onClose={() => setShowContext(false)} />
      )}
    </div>
  );
});
