import React, { useState } from 'react';
import { Settings, MoreVertical, Pencil, Music2, X, Share, Eye, QrCode } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function Profile() {
  const { user, playlists, setActiveSection } = usePlayer();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-[#121212]">
        <p>Please log in to view profile.</p>
        <button onClick={() => setActiveSection('login')} className="mt-4 px-4 py-2 bg-cyan-500 rounded-full text-black font-bold">Log In</button>
      </div>
    );
  }

  const handleEditClick = () => {
    setEditName(user.name || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editName.trim() === '') return;
    const updatedUser = { ...user, name: editName.trim() };
    localStorage.setItem('rhythmix_session', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('userUpdated')); // Broadcast change to App.jsx
    setIsEditing(false);
  };

  const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

  // ─── Edit Profile Full Screen Modal ──────────────────────────────
  if (isEditing) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#121212] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => setIsEditing(false)} className="text-white hover:text-white/80 p-1 cursor-pointer">
            <X size={24} />
          </button>
          <h1 className="text-white font-bold text-lg">Edit profile</h1>
          <button onClick={handleSave} className="text-white font-bold hover:text-white/80 p-1 cursor-pointer">
            Save
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center mt-8 px-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-[#d28b61] flex items-center justify-center shadow-2xl">
              <span className="text-black text-6xl font-bold">{initial}</span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors cursor-pointer">
              <Pencil size={16} className="text-black" />
            </button>
          </div>

          <div className="w-full mt-12 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-white font-bold text-sm w-20">Name</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 bg-transparent text-white outline-none text-sm font-medium border-none"
                autoFocus
              />
            </div>
            <hr className="border-white/10 mt-3" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Normal Profile View ─────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-y-auto w-full pb-6">
      {/* Top Gradient Background */}
      <div className="relative pt-8 pb-6 px-4 bg-gradient-to-b from-[#b3704b] to-[#121212]">
        
        <div className="flex flex-col items-start mt-2">
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
          <div className="flex items-center gap-5 mt-6 relative w-full">
            <button onClick={handleEditClick} className="px-4 py-1.5 rounded-full border border-white/30 text-white font-bold text-xs hover:border-white transition cursor-pointer">
              Edit
            </button>
            <button className="text-white/80 hover:text-white transition p-1 cursor-pointer ml-auto">
              <Settings size={20} />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)} 
                className="text-white/80 hover:text-white transition p-1 cursor-pointer"
              >
                <MoreVertical size={20} />
              </button>

              {/* 3-Dot Dropdown Menu */}
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#282828] rounded-md shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/10 transition-colors text-sm font-medium text-left">
                      <Share size={18} />
                      Share
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/10 transition-colors text-sm font-medium text-left">
                      <Eye size={18} />
                      Preview profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-white/90 hover:bg-white/10 transition-colors text-sm font-medium text-left">
                      <QrCode size={18} />
                      Show Rhythmix code
                    </button>
                  </div>
                </>
              )}
            </div>
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
