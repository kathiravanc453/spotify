import { useMemo, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/shared/SongRow';
import { Disc, ChevronLeft, Play, Music2, Layers, FolderHeart } from 'lucide-react';
import { cleanTitle, moodAccent } from '../utils/cleanTitle';

const normalizeMood = (mood) => {
  if (!mood) return '';
  return mood.toLowerCase().trim().replace(/\b\w/g, l => l.toUpperCase());
};

export default function Albums() {
  const { allSongs = [], currentSong, isPlaying, playSong, albumCovers = {} } = usePlayer() || {};
  const [selectedAlbumName, setSelectedAlbumName] = useState(null);
  const [selectedMoodName, setSelectedMoodName] = useState(null);
  const [activeMoodFilter, setActiveMoodFilter] = useState('All');
  const [viewType, setViewType] = useState('albums');

  // Group songs dynamically by their album metadata
  const albums = useMemo(() => {
    const grouped = {};
    
    allSongs.forEach((song) => {
      const albumName = song.album?.trim() || 'Singles';
      if (!grouped[albumName]) {
        grouped[albumName] = {
          name: albumName,
          artist: song.artist && song.artist !== 'Cloud Artist' ? song.artist : 'Various Artists',
          // Use the first song's real fetched cover for the album card
          representativeSongId: song.id,
          cover: song.cover || '/favicon.svg',
          fallbackCover: song.fallbackCover,
          songs: []
        };
      }
      grouped[albumName].songs.push(song);
    });

    return Object.values(grouped);
  }, [allSongs]);

  // Group songs by mood
  const moods = useMemo(() => {
    const grouped = {};
    allSongs.forEach(song => {
      const mood = normalizeMood(song.mood);
      if (!mood) return; // Skip songs without mood
      if (!grouped[mood]) {
        grouped[mood] = {
          name: mood,
          artist: 'Various Artists',
          representativeSongId: song.id,
          cover: song.cover,
          fallbackCover: song.fallbackCover,
          songs: []
        };
      }
      grouped[mood].songs.push(song);
    });
    return Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name));
  }, [allSongs]);

  // Find the selected collection (Album or Mood Folder)
  const selectedCollection = useMemo(() => {
    if (viewType === 'albums' && selectedAlbumName) {
      return albums.find(a => a.name === selectedAlbumName);
    }
    if (viewType === 'moods' && selectedMoodName) {
      return moods.find(m => m.name === selectedMoodName);
    }
    return null;
  }, [viewType, selectedAlbumName, selectedMoodName, albums, moods]);

  // Extract unique moods present inside this specific collection (only makes sense for Albums view)
  const selectedAlbumMoods = useMemo(() => {
    if (!selectedCollection || viewType === 'moods') return [];
    const collMoods = selectedCollection.songs.map(s => normalizeMood(s.mood)).filter(Boolean);
    return Array.from(new Set(collMoods)).sort();
  }, [selectedCollection, viewType]);

  // Filter songs dynamically inside the collection detail based on selected mood pill
  const filteredSongs = useMemo(() => {
    if (!selectedCollection) return [];
    if (viewType === 'moods') return selectedCollection.songs; // Mood folders don't need inner mood filtering
    if (!activeMoodFilter || activeMoodFilter === 'All') return selectedCollection.songs;
    return selectedCollection.songs.filter(s => normalizeMood(s.mood) === activeMoodFilter);
  }, [selectedCollection, activeMoodFilter, viewType]);

  // Play the entire collection starting from the first song
  const handlePlayCollection = () => {
    if (selectedCollection && filteredSongs.length > 0) {
      playSong(filteredSongs[0]);
    }
  };

  // 1. Detail View (Album or Mood)
  if (selectedCollection) {
    return (
      <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300 pb-[120px]">
        {/* Back navigation button */}
        <button
          onClick={() => {
            if (viewType === 'albums') setSelectedAlbumName(null);
            else setSelectedMoodName(null);
            setActiveMoodFilter('All');
          }}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors font-semibold text-sm cursor-pointer w-fit"
        >
          <ChevronLeft size={16} />
          Back to {viewType === 'albums' ? 'Albums' : 'Moods'}
        </button>

        {/* Dynamic Header Block */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 pb-6 border-b border-white/5">
          <div className="relative group w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex-shrink-0 bg-white/5">
            <img
              src={albumCovers[selectedCollection.representativeSongId] || selectedCollection.cover}
              alt={selectedCollection.name}
              onError={(e) => {
                if (selectedCollection.fallbackCover && e.target.src !== selectedCollection.fallbackCover) {
                  e.target.src = selectedCollection.fallbackCover;
                } else {
                  e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
                }
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button 
                onClick={handlePlayCollection}
                className="w-14 h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                <Play size={24} fill="currentColor" className="ml-1" />
              </button>
            </div>
          </div>

          <div className="text-center md:text-left space-y-2 md:space-y-4">
            <span className={`text-xs font-bold uppercase tracking-widest border px-3 py-1 rounded-full w-fit ${viewType === 'albums' ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800/30' : 'text-violet-400 bg-violet-950/40 border-violet-800/30'}`}>
              {viewType === 'albums' ? 'Album' : 'Mood Folder'}
            </span>
            <h1 className="text-white text-3xl md:text-5xl font-extrabold leading-none tracking-tight">
              {selectedCollection.name}
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-2 text-white/50 text-sm font-semibold">
              <span className="text-white/80">{selectedCollection.artist}</span>
              <span className="hidden sm:inline">•</span>
              <span>{selectedCollection.songs.length} {selectedCollection.songs.length === 1 ? 'track' : 'tracks'}</span>
            </div>
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
                All Tracks ({selectedCollection.songs.length})
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
                  {mood} ({selectedCollection.songs.filter(s => normalizeMood(s.mood) === mood).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tracks List */}
        <div className="space-y-1">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx + 1}
                isPlaying={isPlaying && currentSong?.id === song.id}
                isActive={currentSong?.id === song.id}
                onClick={() => playSong(song)}
              />
            ))
          ) : (
            <div className="py-12 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
              <Music2 size={32} className="mx-auto mb-3 text-white/10" />
              <p className="text-white/30 text-xs">No tracks match the selected mood in this album.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const collectionsList = viewType === 'albums' ? albums : moods;

  // 2. Collection Grid View
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-[120px]">
      <div>
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-300 font-extrabold text-3xl tracking-tight mb-2">
          Collections
        </h1>
        <p className="text-white/45 text-sm font-medium">Browse your music library by albums or folders.</p>
      </div>

      {/* Toggle View Type */}
      <div className="flex bg-black/40 p-1.5 rounded-xl w-fit border border-white/5 shadow-inner">
        <button 
          onClick={() => setViewType('albums')} 
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${viewType === 'albums' ? 'bg-white text-black shadow-md scale-100' : 'text-white/40 hover:text-white/80 scale-95'}`}
        >
          <Disc size={16} /> Albums
        </button>
        <button 
          onClick={() => setViewType('moods')} 
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${viewType === 'moods' ? 'bg-white text-black shadow-md scale-100' : 'text-white/40 hover:text-white/80 scale-95'}`}
        >
          <FolderHeart size={16} /> Mood Folders
        </button>
      </div>

      {collectionsList.length === 0 ? (
        <div className="text-center py-24 bg-white/[0.01] border border-white/5 rounded-3xl">
          <Disc size={48} className="mx-auto mb-4 text-white/10" />
          <p className="text-white/30 font-medium">No {viewType} found in your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
          {collectionsList.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                if (viewType === 'albums') setSelectedAlbumName(item.name);
                else setSelectedMoodName(item.name);
              }}
              className="group flex flex-col text-left w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 p-4 rounded-3xl transition-all duration-350 cursor-pointer"
            >
              {/* Cover wrapper with CD overlay effect */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 shadow-lg shadow-black/25 bg-white/5">
                <img
                  src={albumCovers[item.representativeSongId] || item.cover}
                  alt={item.name}
                  onError={(e) => {
                    if (item.fallbackCover && e.target.src !== item.fallbackCover) {
                      e.target.src = item.fallbackCover;
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
              <div className="px-1 min-w-0 flex-1 flex flex-col justify-between h-full mt-2">
                <div>
                  <h3 className="text-white font-bold text-sm truncate group-hover:text-cyan-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-white/40 text-xs truncate mt-0.5 font-medium">
                    {item.artist}
                  </p>
                </div>
                
                {/* Dynamically display unique moods on the card */}
                <div className="flex flex-wrap gap-1 mt-3">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-wider bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-md">
                    {item.songs.length} Tracks
                  </span>
                  {viewType === 'albums' && Array.from(new Set(item.songs.map(s => normalizeMood(s.mood)).filter(Boolean))).slice(0, 2).map(m => (
                    <span key={m} className="text-[9px] text-cyan-400/80 font-bold uppercase tracking-wider bg-cyan-950/20 border border-cyan-800/10 px-1.5 py-0.5 rounded-md">
                      {m}
                    </span>
                  ))}
                  {viewType === 'moods' && (
                    <span className="text-[9px] text-violet-400/80 font-bold uppercase tracking-wider bg-violet-950/20 border border-violet-800/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                      <FolderHeart size={10} /> Mood
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
