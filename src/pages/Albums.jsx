import { usePlayer } from '../context/PlayerContext';
import { Disc, Play } from 'lucide-react';

export default function Albums({ setSearch }) {
  const { saavnHomeData = {}, setActiveSection } = usePlayer() || {};
  const globalAlbums = saavnHomeData.albums || [];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-[120px]">
      <div>
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-300 font-extrabold text-3xl tracking-tight mb-2">
          Global Albums
        </h1>
        <p className="text-white/45 text-sm font-medium">Browse the hottest trending albums globally</p>
      </div>

      {globalAlbums.length === 0 ? (
        <div className="text-center py-24 bg-white/[0.01] border border-white/5 rounded-3xl">
          <Disc size={48} className="mx-auto mb-4 text-white/10" />
          <p className="text-white/30 font-medium">Loading albums...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
          {globalAlbums.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (setSearch) {
                  setSearch(`${item.title} Tamil`);
                  setActiveSection('search');
                }
              }}
              className="group flex flex-col text-left w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 p-4 rounded-3xl transition-all duration-350 cursor-pointer"
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 shadow-lg shadow-black/25 bg-white/5">
                <img
                  src={item.cover || item.image}
                  alt={item.title}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Play size={18} className="ml-1" fill="#000" />
                  </div>
                </div>
              </div>

              <div className="px-1 min-w-0 flex-1 flex flex-col justify-between h-full mt-2">
                <div>
                  <h3 className="text-white font-bold text-sm truncate group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-white/40 text-xs truncate mt-0.5 font-medium">
                    {item.subtitle || 'Various Artists'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
