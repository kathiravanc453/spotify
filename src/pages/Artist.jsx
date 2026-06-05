import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/shared/SongRow';
import { ArrowLeft, Play, Shuffle } from 'lucide-react';

export default function Artist() {
  const { allSongs, activeArtist, setActiveSection, playSong, setIsShuffle } = usePlayer();

  if (!activeArtist) {
    setActiveSection('home');
    return null;
  }

  const artistSongs = allSongs.filter(s => s.artist === activeArtist);
  const artistCover = artistSongs[0]?.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';

  const handlePlayAll = () => {
    if (artistSongs.length > 0) {
      setIsShuffle(false);
      playSong(artistSongs[0]);
    }
  };

  const handleShuffle = () => {
    if (artistSongs.length > 0) {
      setIsShuffle(true);
      const randomSong = artistSongs[Math.floor(Math.random() * artistSongs.length)];
      playSong(randomSong);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 w-full mb-8">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${artistCover})`, filter: 'brightness(0.5)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/60 to-transparent" />
        
        {/* Back Button */}
        <button 
          onClick={() => setActiveSection('home')}
          className="absolute top-6 left-6 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full flex items-end gap-6">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shadow-2xl border-4 border-[#07070a] flex-shrink-0">
            <img src={artistCover} alt={activeArtist} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-white text-4xl md:text-6xl font-extrabold tracking-tight mb-2 truncate">
              {activeArtist}
            </h1>
            <p className="text-white/60 font-medium">
              {artistSongs.length} {artistSongs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10">
        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handlePlayAll}
            className="w-14 h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105 active:scale-95"
          >
            <Play size={24} fill="#000" color="#000" className="ml-1" />
          </button>
          <button 
            onClick={handleShuffle}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <Shuffle size={20} />
          </button>
        </div>

        {/* Song List */}
        <div className="flex flex-col gap-2">
          {artistSongs.map((song, i) => (
            <SongRow key={song.id} song={song} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
