import React from 'react';
import { ArrowLeft, Settings, MoreVertical, Pencil, Music2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function Profile() {
  const { user, playlists, setActiveSection } = usePlayer();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <p>Please log in to view profile.</p>
        <button onClick={() => setActiveSection('login')} className="mt-4 px-4 py-2 bg-cyan-500 rounded-full text-black font-bold">Log In</button>
      </div>
    );
  }

  // Get first letter of name for the avatar
  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-y-auto w-full pb-6">
      {/* Top Gradient Background */}
      <div className="relative pt-12 pb-6 px-4 bg-gradient-to-b from-[#b3704b] to-[#121212]">
        
        {/* Back Arrow */}
        <button 
          onClick={() => setActiveSection('home')}
          className="absolute top-4 left-4 text-white hover:text-white/80 transition"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-start mt-6">
          <div className="flex items-center gap-5">
            {/* Circular Avatar */}
            <div className="w-24 h-24 rounded-full bg-[#d28b61] flex items-center justify-center shadow-2xl flex-shrink-0">
              <span className="text-black text-5xl font-bold">{initial}</span>
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-white text-3xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-white/60 text-[11px] font-semibold mt-1">
                0 followers • 0 following
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-5 mt-6">
            <button className="px-4 py-1.5 rounded-full border border-white/30 text-white font-bold text-xs hover:border-white transition cursor-pointer">
              Edit
            </button>
            <button className="text-white/80 hover:text-white transition p-1 cursor-pointer">
              <Settings size={20} />
            </button>
            <button className="text-white/80 hover:text-white transition p-1 cursor-pointer">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 py-2 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">Playlists</h2>
          <button className="flex items-center gap-1.5 text-white/70 hover:text-white transition text-xs font-bold cursor-pointer">
            <Pencil size={14} />
            <span>Manage</span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {playlists && playlists.length > 0 ? (
            playlists.map((pl) => (
              <div 
                key={pl.id} 
                className="flex items-center gap-3 cursor-pointer group hover:bg-white/[0.04] p-1.5 rounded-lg -mx-1.5 transition-colors"
                onClick={() => setActiveSection(`playlist_${pl.id}`)}
              >
                {/* Playlist Thumbnail Grid (Simulation) */}
                <div className="w-14 h-14 bg-white/5 rounded-md overflow-hidden flex flex-wrap border border-white/5">
                  <div className="w-full h-full bg-gradient-to-br from-[#d28b61]/20 to-black/50 flex items-center justify-center">
                     <Music2 size={20} className="text-white/30" />
                  </div>
                </div>
                
                <div className="flex flex-col flex-1">
                  <span className="text-white text-sm font-medium group-hover:text-cyan-400 transition">{pl.name}</span>
                  <span className="text-white/50 text-xs mt-0.5">{pl.songs?.length || 0} saves</span>
                </div>

                <button className="text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition p-1">
                  <MoreVertical size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-white/50 text-sm">No playlists yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
