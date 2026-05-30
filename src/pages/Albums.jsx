import { useMemo, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/shared/SongRow';
import { Disc, ChevronLeft, Play, Music2, Layers } from 'lucide-react';

export default function Albums() {
  const { allSongs = [], currentSong, isPlaying, playSong } = usePlayer() || {};
  const [selectedAlbumName, setSelectedAlbumName] = useState(null);
  const [activeMoodFilter, setActiveMoodFilter] = useState('All');

  // Group songs dynamically by their album metadata
  const albums = useMemo(() => {
    const grouped = {};
    
    allSongs.forEach((song) => {
      const albumName = song.album?.trim() || 'Singles';
      if (!grouped[albumName]) {
        grouped[albumName] = {
          name: albumName,
          artist: song.artist && song.artist !== 'Cloud Artist' ? song.artist : 'Various Artists',
          cover: song.cover || '/favicon.svg',
          fallbackCover: song.fallbackCover,
          songs: []
        };
      }
      grouped[albumName].songs.push(song);
    });

    return Object.values(grouped);
  }, [allSongs]);

  // Find the selected album data
  const selectedAlbum = useMemo(() => {
    if (!selectedAlbumName) return null;
    return albums.find(a => a.name === selectedAlbumName);
  }, [selectedAlbumName, albums]);

  // Extract unique moods present inside this specific album
  const selectedAlbumMoods = useMemo(() => {
    if (!selectedAlbum) return [];
    return Array.from(new Set(selectedAlbum.songs.map(s => s.mood).filter(Boolean)));
  }, [selectedAlbum]);

  // Filter songs dynamically inside the album detail based on selected mood pill
  const filteredAlbumSongs = useMemo(() => {
    if (!selectedAlbum) return [];
    if (!activeMoodFilter || activeMoodFilter === 'All') return selectedAlbum.songs;
    return selectedAlbum.songs.filter(s => s.mood?.toLowerCase().trim() === activeMoodFilter.toLowerCase().trim());
  }, [selectedAlbum, activeMoodFilter]);

  // Play the entire album (or filtered subset) starting from the first song
  const handlePlayAlbum = () => {
    if (selectedAlbum && filteredAlbumSongs.length > 0) {
      playSong(filteredAlbumSongs[0]);
    }
  };

  // 1. Album Detail View
  if (selectedAlbum) {
    return (
      <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
        {/* Back navigation button */}
        <button
          onClick={() => setSelectedAlbumName(null)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors font-semibold text-sm cursor-pointer"
        >
          <ChevronLeft size={16} />
          Back to Albums
        </button>

        {/* Dynamic Album Header Block */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 pb-6 border-b border-white/5">
          <div className="relative group w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex-shrink-0">
            <img
              src={selectedAlbum.cover}
              alt={selectedAlbum.name}
              onError={(e) => {
                if (selectedAlbum.fallbackCover && e.target.src !== selectedAlbum.fallbackCover) {
                  e.target.src = selectedAlbum.fallbackCover;
                } else {
                  e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
                }
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button 
                onClick={handlePlayAlbum}
                className="w-14 h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                <Play size={24} fill="currentColor" className="ml-1" />
              </button>
            </div>
          </div>

          <div className="text-center md:text-left space-y-2 md:space-y-4">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-3 py-1 rounded-full w-fit">
              Album
            </span>
            <h1 className="text-white text-3xl md:text-5xl font-extrabold leading-none tracking-tight">
              {selectedAlbum.name}
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-2 text-white/50 text-sm font-semibold">
              <span className="text-white/80">{selectedAlbum.artist}</span>
              <span className="hidden sm:inline">•</span>
              <span>{selectedAlbum.songs.length} Tracks</span>
            </div>
            <button
              onClick={handlePlayAlbum}
              className="mt-2 bg-gradient-to-tr from-cyan-400 to-violet-500 hover:from-cyan-300 hover:to-violet-400 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <Play size={16} fill="currentColor" />
              Play Album
            </button>
          </div>
        </div>

        {/* Mood Pill Filters */}
        {selectedAlbumMoods.length > 1 && (
          <div className="space-y-3">
            <h3 className="text-white/40 text-[10px] font-extrabold uppercase tracking-widest pl-1">Filter by Mood</h3>
            <div className="flex flex-wrap gap-2.5 pb-2">
              <button
                onClick={() => setActiveMoodFilter('All')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                  activeMoodFilter === 'All'
                    ? 'bg-cyan-400 text-black shadow-md shadow-cyan-400/10'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                All Tracks ({selectedAlbum.songs.length})
              </button>
              {selectedAlbumMoods.map(mood => (
                <button
                  key={mood}
                  onClick={() => setActiveMoodFilter(mood)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                    activeMoodFilter === mood
                      ? 'bg-gradient-to-tr from-cyan-400 to-violet-500 text-white shadow-md shadow-cyan-500/15'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {mood} ({selectedAlbum.songs.filter(s => s.mood === mood).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tracks List */}
        <div className="space-y-2.5">
          <h2 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Tracks</h2>
          <div className="flex flex-col gap-1.5">
            {filteredAlbumSongs.length === 0 ? (
              <div className="text-center py-10 bg-white/[0.01] border border-white/5 rounded-2xl">
                <p className="text-white/30 text-xs">No tracks match the selected mood in this album.</p>
              </div>
            ) : (
              filteredAlbumSongs.map((song, idx) => (
                <SongRow key={song.id} song={song} index={idx} />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. Albums List View
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-300 font-extrabold text-3xl tracking-tight mb-2">
          Albums
        </h1>
        <p className="text-white/45 text-sm font-medium">Browse your collection grouped by albums</p>
      </div>

      {albums.length === 0 ? (
        <div className="text-center py-24 bg-white/[0.01] border border-white/5 rounded-3xl">
          <Disc size={48} className="mx-auto mb-4 text-white/10" />
          <p className="text-white/30 font-medium">No albums found in your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
          {albums.map((album) => (
            <button
              key={album.name}
              onClick={() => setSelectedAlbumName(album.name)}
              className="group flex flex-col text-left w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 p-4 rounded-3xl transition-all duration-350 cursor-pointer"
            >
              {/* Cover wrapper with CD overlay effect */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 shadow-lg shadow-black/25">
                <img
                  src={album.cover}
                  alt={album.name}
                  onError={(e) => {
                    if (album.fallbackCover && e.target.src !== album.fallbackCover) {
                      e.target.src = album.fallbackCover;
                    } else {
                      e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Vinyl record hover icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Layers size={18} />
                  </div>
                </div>
              </div>

              {/* Text metadata */}
              <div className="px-1 min-w-0 flex-1 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-white font-bold text-sm truncate group-hover:text-cyan-400 transition-colors">
                    {album.name}
                  </h3>
                  <p className="text-white/40 text-xs truncate mt-0.5 font-medium">
                    {album.artist}
                  </p>
                </div>
                
                {/* Dynamically display unique moods on the card */}
                <div className="flex flex-wrap gap-1 mt-3">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-md">
                    {album.songs.length} Tracks
                  </span>
                  {Array.from(new Set(album.songs.map(s => s.mood).filter(Boolean))).slice(0, 2).map(m => (
                    <span key={m} className="text-[9px] text-cyan-400/80 font-bold uppercase tracking-wider bg-cyan-950/20 border border-cyan-800/10 px-1.5 py-0.5 rounded-md">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
