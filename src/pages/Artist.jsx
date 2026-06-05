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

  const getArtistColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    // Return a rich, vibrant color typical of Spotify artist pages
    return `hsl(${h}, 60%, 35%)`;
  };

  const dominantColor = getArtistColor(activeArtist);

  return (
    <div className="animate-in fade-in duration-500 pb-32 h-full overflow-y-auto scrollbar-none bg-[#121212]">
      {/* Hero Banner with Dynamic Gradient */}
      <div 
        className="relative h-[40vh] min-h-[340px] w-full mb-8 transition-colors duration-700"
        style={{ backgroundColor: dominantColor }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url(${artistCover})` }}
        />
        {/* Spotify-style gradient fade to bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#121212]" />
        
        {/* Back Button */}
        <button 
          onClick={() => setActiveSection('home')}
          className="absolute top-6 left-6 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Content Container */}
        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full flex items-end gap-6 z-10">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex-shrink-0 border-none">
            <img src={artistCover} alt={activeArtist} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span className="text-white text-sm font-medium">Verified Artist</span>
            </div>
            <h1 className="text-white text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 truncate drop-shadow-lg">
              {activeArtist}
            </h1>
            <p className="text-white/80 font-medium text-sm md:text-base">
              {artistSongs.length} {artistSongs.length === 1 ? 'Track' : 'Tracks'} available in library
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area with extended gradient */}
      <div 
        className="px-6 md:px-8 relative min-h-screen"
        style={{ backgroundImage: `linear-gradient(to bottom, ${dominantColor}40 0%, transparent 400px)` }}
      >
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
