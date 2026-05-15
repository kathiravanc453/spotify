import { useState, useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/shared/SongCard';
import SongRow from '../components/shared/SongRow';
import songs from '../data/songs.json';
import { TrendingUp, Star, Clock, Music } from 'lucide-react';

function SectionHeader({ icon: Icon, title, gradient }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${gradient}`}>
        <Icon size={16} color="#000" />
      </div>
      <h2 className="text-white text-xl font-bold">{title}</h2>
    </div>
  );
}

export default function Home({ search }) {
  const { recentlyPlayed, allSongs } = usePlayer();

  const trending = useMemo(() => songs.filter(s => s.trending), []);
  const recommended = useMemo(() => songs.filter(s => s.recommended), []);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return songs.filter(
      s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    );
  }, [search]);

  if (search.trim()) {
    return (
      <div className="p-4 md:p-8">
        <SectionHeader icon={Music} title={`Search results for "${search}"`} gradient="bg-white/20" />
        {searchResults.length === 0 ? (
          <div className="text-white/30 text-center py-16">
            <Music size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No songs found for "{search}"</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {searchResults.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-10">

      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden h-48 md:h-60">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${songs[0]?.cover})`, filter: 'blur(2px) brightness(0.4)', transform: 'scale(1.05)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-8">
          <p className="text-spotify-green text-xs font-semibold uppercase tracking-widest mb-1">Now Trending</p>
          <h1 className="text-white text-2xl md:text-4xl font-bold leading-tight drop-shadow-lg">{songs[0]?.title}</h1>
          <p className="text-white/70 text-sm mt-1">{songs[0]?.artist}</p>
        </div>
      </div>

      {/* Trending */}
      <section>
        <SectionHeader icon={TrendingUp} title="Trending Now" gradient="bg-orange-400" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {trending.map(song => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </section>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section>
          <SectionHeader icon={Clock} title="Recently Played" gradient="bg-blue-400" />
          <div className="flex flex-col gap-1">
            {recentlyPlayed.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended */}
      <section>
        <SectionHeader icon={Star} title="Recommended For You" gradient="bg-spotify-green" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {recommended.map(song => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </section>
    </div>
  );
}
