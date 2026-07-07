import { useState } from 'react';
import { X, Plus, Music2, Check, Search } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function PlaylistModal() {
  const { isPlaylistModalOpen, closePlaylistModal, songForPlaylist, playlists, createPlaylist, addSongToPlaylist, removeSongFromPlaylist } = usePlayer();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [search, setSearch] = useState('');

  if (!isPlaylistModalOpen || !songForPlaylist) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName);
    setNewPlaylistName('');
  };

  const filteredPlaylists = playlists.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={closePlaylistModal}
      />
      <div className="relative w-full max-w-sm bg-[#12121a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">Add to Playlist</h2>
          <button 
            onClick={closePlaylistModal}
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selected Song Preview */}
        <div className="p-4 flex items-center gap-3 bg-white/[0.02]">
          <img 
            src={songForPlaylist.image || songForPlaylist.cover} 
            alt={songForPlaylist.title} 
            className="w-12 h-12 rounded-lg object-cover shadow-md"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-white text-sm font-bold truncate">{songForPlaylist.title}</h3>
            <p className="text-white/50 text-xs truncate">{songForPlaylist.artist}</p>
          </div>
        </div>

        {/* Create New Playlist Input */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <form onSubmit={handleCreate} className="relative">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-white text-sm focus:border-cyan-500/50 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-cyan-500 text-black disabled:opacity-50 disabled:bg-white/10 disabled:text-white/30"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </form>
        </div>

        {/* Search Existing Playlists */}
        {playlists.length > 0 && (
          <div className="px-4 pt-4 relative">
            <Search size={14} className="absolute left-7 top-7 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a playlist..."
              className="w-full bg-transparent border-b border-white/10 py-2 pl-8 pr-4 text-white text-sm focus:border-cyan-500/50 outline-none transition-colors"
            />
          </div>
        )}

        {/* Playlists List */}
        <div className="max-h-60 overflow-y-auto p-2" style={{ scrollbarWidth: 'none' }}>
          {playlists.length === 0 ? (
            <div className="text-center py-8">
              <Music2 size={32} className="mx-auto mb-2 text-white/20" />
              <p className="text-white/40 text-sm">No playlists yet</p>
            </div>
          ) : filteredPlaylists.length === 0 ? (
            <p className="text-center py-6 text-white/40 text-sm">No playlists found</p>
          ) : (
            filteredPlaylists.map(playlist => {
              const hasSong = playlist.songs.some(s => s.id === songForPlaylist.id);
              return (
                <div 
                  key={playlist.id}
                  onClick={() => {
                    if (hasSong) {
                      removeSongFromPlaylist(playlist.id, songForPlaylist.id);
                    } else {
                      addSongToPlaylist(playlist.id, songForPlaylist);
                    }
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-900/40 to-violet-900/40 border border-white/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                    {playlist.songs.length > 0 ? (
                      <img src={playlist.songs[0].cover} alt="Cover" className="w-full h-full object-cover opacity-60" />
                    ) : (
                      <Music2 size={16} className="text-white/40" />
                    )}
                    {hasSong && (
                      <div className="absolute inset-0 bg-cyan-500/80 flex items-center justify-center backdrop-blur-sm">
                        <Check size={16} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold truncate transition-colors ${hasSong ? 'text-cyan-400' : 'text-white'}`}>
                      {playlist.name}
                    </h4>
                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mt-0.5">
                      {playlist.songs.length} {playlist.songs.length === 1 ? 'Song' : 'Songs'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
