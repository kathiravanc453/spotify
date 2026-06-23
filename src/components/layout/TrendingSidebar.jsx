import { usePlayer } from '../../context/PlayerContext';
import { cleanTitle, moodAccent } from '../../utils/cleanTitle';
import { Play, TrendingUp, Music } from 'lucide-react';

function Equalizer() {
  return (
    <div className="flex items-end gap-[2px] h-3">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`w-[2px] bg-cyan-400 rounded-full ${
            i === 0 ? 'animate-equalize' : i === 1 ? 'animate-equalize-delayed-1' : 'animate-equalize-delayed-2'
          }`}
          style={{ minHeight: '3px' }}
        />
      ))}
    </div>
  );
}

export default function TrendingSidebar() {
  const { saavnHomeData, currentSong, isPlaying, playSong, albumCovers = {} } = usePlayer();
  const trendingSongs = saavnHomeData?.trending || [];

  if (!trendingSongs.length) return null;

  return (
    <aside className="hidden xl:flex flex-col w-72 min-h-screen bg-black/20 backdrop-blur-3xl border-l border-white/5 flex-shrink-0 z-20 py-6 px-4">
      
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <TrendingUp size={16} className="text-white" />
        </div>
        <h2 className="text-white font-extrabold text-lg tracking-tight">Trending Now</h2>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {trendingSongs.slice(0, 10).map((song, idx) => {
          const isActive = currentSong?.id === song.id;
          const isCurrentlyPlaying = isActive && isPlaying;
          const accent = moodAccent(song.mood);
          const realCover = albumCovers[song.id] || song.cover;
          const displayTitle = cleanTitle(song.title);

          return (
            <button
              key={song.id}
              onClick={() => playSong(song, { initialQueue: trendingSongs.slice(0, 10) })}
              className={`group flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 text-left ${
                isActive 
                  ? 'bg-white/[0.08] border border-cyan-500/20 shadow-lg' 
                  : 'hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div className="w-4 text-center flex-shrink-0">
                <span className={`text-[10px] font-bold ${isActive ? 'text-cyan-400' : 'text-white/30'}`}>
                  {idx + 1}
                </span>
              </div>

              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                <img 
                  src={realCover} 
                  alt={song.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isCurrentlyPlaying ? (
                    <Equalizer />
                  ) : (
                    <Play size={12} fill="#fff" className="text-white ml-0.5" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <h4 className={`text-xs font-bold truncate ${isActive ? 'text-cyan-400' : 'text-white/90 group-hover:text-white'}`}>
                  {displayTitle}
                </h4>
                <p className="text-white/40 text-[10px] truncate mt-0.5">
                  {song.artist}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
