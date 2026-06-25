import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/shared/SongRow';
import { History, Search, Music2 } from 'lucide-react';

export default function Recents() {
  const { recentlyPlayed = [] } = usePlayer() || {};
  const [search, setSearch] = useState('');

  const filtered = recentlyPlayed.filter(s => 
    s.title?.toLowerCase().includes(search.toLowerCase()) || 
    s.artist?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <History size={24} color="#fff" />
            </div>
            <h2 className="text-white text-3xl font-extrabold tracking-tight">Recently Played</h2>
          </div>
          <p className="text-white/40 text-sm">Your listening history, all in one place.</p>
        </div>
        
        {recentlyPlayed.length > 0 && (
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/5 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
        )}
      </div>

      {recentlyPlayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
          <Music2 size={48} className="text-white/10 mb-4" />
          <p className="text-white/40 text-lg font-medium text-center px-4">
            You haven't played any songs recently.
            <br />
            <span className="text-sm">Start exploring to build your history!</span>
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
          <p className="text-white/30 font-medium">No matches found in your history.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((song, i) => (
            <SongRow key={`${song.id}-${i}`} song={song} index={i} songsList={filtered} />
          ))}
        </div>
      )}
    </div>
  );
}
