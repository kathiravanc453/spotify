import { useMemo, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/shared/SongCard';
import SongRow from '../components/shared/SongRow';
import { Heart, Zap, Coffee, Sparkles, Music2, ChevronLeft, Music, Search, X, Play } from 'lucide-react';

import { CloudRain } from 'lucide-react'; // Need CloudRain for Sad mood

const MASTER_MOODS = ['kuthu', 'romance', 'melody', 'sad', 'vibes'];

const MOOD_THEMES = {
  'kuthu':        { label: 'Kuthu',        icon: Zap,        grad: 'from-violet-600 via-indigo-500 to-violet-800',desc: 'High Energy Beats',     glow: 'shadow-violet-500/30' },
  'romance':      { label: 'Romance',      icon: Heart,      grad: 'from-fuchsia-600 via-rose-500 to-pink-800', desc: 'Sweet & Romantic',      glow: 'shadow-fuchsia-500/30' },
  'melody':       { label: 'Melody',       icon: Sparkles,   grad: 'from-cyan-600 via-blue-600 to-cyan-800',    desc: 'Pure musical bliss',    glow: 'shadow-cyan-500/30' },
  'sad':          { label: 'Sad',          icon: CloudRain,  grad: 'from-slate-600 via-gray-600 to-slate-800',  desc: 'Emotional & Broken',    glow: 'shadow-slate-500/30' },
  'vibes':        { label: 'Vibes',        icon: Coffee,     grad: 'from-amber-600 via-orange-500 to-amber-800',desc: 'Chill & Relax',         glow: 'shadow-amber-500/30' },
};

// Mini 2×2 collage of song covers for a mood card
function CoverCollage({ songs, albumCovers }) {
  const covers = songs
    .slice(0, 4)
    .map(s => albumCovers[s.id] || s.cover)
    .filter(Boolean);

  if (covers.length === 0) return null;

  return (
    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-30">
      {[0,1,2,3].map(i => (
        <div key={i} className="overflow-hidden">
          {covers[i] && (
            <img
              src={covers[i]}
              alt=""
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Library() {
  const { allSongs = [], favorites = [], activeSection, setActiveSection, albumCovers = {}, setActiveArtist } = usePlayer() || {};
  const [selectedMood, setSelectedMood] = useState(null);
  const [showArtistsList, setShowArtistsList] = useState(false);
  const [moodSearchQuery, setMoodSearchQuery] = useState('');
  const [artistSearchQuery, setArtistSearchQuery] = useState('');

  const showLiked = activeSection === 'favorites';

  const moodFilteredAndSearchedSongs = useMemo(() => {
    if (!selectedMood) return [];
    const base = allSongs.filter(s => s?.mood?.toLowerCase().trim().includes(selectedMood));
    if (!moodSearchQuery.trim()) return base;
    return base.filter(s =>
      s.title?.toLowerCase().includes(moodSearchQuery.toLowerCase()) ||
      s.artist?.toLowerCase().includes(moodSearchQuery.toLowerCase())
    );
  }, [selectedMood, allSongs, moodSearchQuery]);

  const uniqueArtists = useMemo(() => {
    const artistMap = {};
    allSongs.forEach(song => {
      if (!song.artist || song.artist === 'Unknown Artist') return;
      if (!artistMap[song.artist]) {
        artistMap[song.artist] = { name: song.artist, cover: song.cover || '', count: 1 };
      } else {
        artistMap[song.artist].count++;
        if (!artistMap[song.artist].cover && song.cover) {
          artistMap[song.artist].cover = song.cover;
        }
      }
    });
    const list = Object.values(artistMap).sort((a, b) => b.count - a.count);
    if (!artistSearchQuery.trim()) return list;
    return list.filter(a => a.name.toLowerCase().includes(artistSearchQuery.toLowerCase()));
  }, [allSongs, artistSearchQuery]);

  const likedSongs = useMemo(() => allSongs.filter(s => favorites.includes(s.id)), [favorites, allSongs]);

  // ── 0. Custom Playlist View ───────────────────────────────────────────────
  const { playlists = [], deletePlaylist } = usePlayer() || {};
  const isPlaylistView = activeSection?.startsWith('playlist_');
  
  if (isPlaylistView) {
    const playlistId = activeSection.split('playlist_')[1];
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) {
      return (
        <div className="p-8 text-center mt-20">
          <p className="text-white/40">Playlist not found.</p>
          <button onClick={() => setActiveSection('home')} className="mt-4 text-cyan-400 font-bold">Go Home</button>
        </div>
      );
    }

    const playlistSongs = playlist.songs.map(id => allSongs.find(s => s?.id === id)).filter(Boolean);

    return (
      <div className="p-4 md:p-8 animate-in fade-in slide-in-from-left-4 duration-300 pb-[140px]">
        <button
          onClick={() => setActiveSection('home')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors font-semibold text-sm cursor-pointer"
        >
          <ChevronLeft size={16} /> Back to Home
        </button>

        {/* Header */}
        <div className="relative rounded-3xl overflow-hidden mb-8 p-6 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(168,85,247,0.1))' }}>
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 flex-shrink-0">
              <Music2 size={28} className="text-white" />
            </div>
            <div className="relative">
              <h1 className="text-white text-3xl font-extrabold tracking-tight">{playlist.name}</h1>
              <p className="text-white/50 text-sm font-semibold mt-0.5">{playlistSongs.length} songs</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this playlist?')) {
                deletePlaylist(playlist.id);
                setActiveSection('home');
              }
            }}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-sm font-bold transition-colors"
          >
            Delete
          </button>
        </div>

        {playlistSongs.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
            <Music2 size={44} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/40 font-medium">This playlist is empty.</p>
            <p className="text-white/30 text-sm mt-1">Click the + icon on any song to add it here!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {playlistSongs.map((song, idx) => <SongRow key={song?.id} song={song} index={idx} />)}
          </div>
        )}
      </div>
    );
  }

  // ── 1. Liked Songs View ─────────────────────────────────────────────────
  if (showLiked) {
    return (
      <div className="p-4 md:p-8 animate-in fade-in slide-in-from-left-4 duration-300 pb-[140px]">
        <button
          onClick={() => setActiveSection('library')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors font-semibold text-sm cursor-pointer"
        >
          <ChevronLeft size={16} /> Back to Library
        </button>

        {/* Header */}
        <div className="relative rounded-3xl overflow-hidden mb-8 p-6 flex items-center gap-5"
          style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(236,72,153,0.1))' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-rose-950/60 to-transparent" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30 flex-shrink-0">
            <Heart size={28} className="text-white fill-white" />
          </div>
          <div className="relative">
            <h1 className="text-white text-3xl font-extrabold tracking-tight">Liked Songs</h1>
            <p className="text-white/50 text-sm font-semibold mt-0.5">{likedSongs.length} songs saved</p>
          </div>
        </div>

        {likedSongs.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
            <Heart size={44} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/40 font-medium">No liked songs yet. Tap the ♥ on any song!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {likedSongs.map((song, idx) => <SongRow key={song?.id} song={song} index={idx} />)}
          </div>
        )}
      </div>
    );
  }

  // ── 2. Mood Filtered Songs View ─────────────────────────────────────────
  if (selectedMood) {
    const theme = MOOD_THEMES[selectedMood] || { label: selectedMood, icon: Music, grad: 'from-purple-500 to-indigo-500', glow: '' };
    const Icon = theme.icon;
    const songCount = moodFilteredAndSearchedSongs.length;
    const allMoodSongs = allSongs.filter(s => s?.mood?.toLowerCase().trim().includes(selectedMood));

    return (
      <div className="p-4 md:p-8 animate-in fade-in slide-in-from-left-4 duration-300 pb-[140px]">
        <button
          onClick={() => { setSelectedMood(null); setMoodSearchQuery(''); }}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors font-semibold text-sm cursor-pointer"
        >
          <ChevronLeft size={16} /> Back to Library
        </button>

        {/* Mood Header */}
        <div className={`relative rounded-3xl overflow-hidden mb-8 p-6 flex items-center gap-5 shadow-xl ${theme.glow}`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${theme.grad} opacity-15`} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07070a]/80 to-transparent" />
          <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-tr ${theme.grad} flex items-center justify-center shadow-lg ${theme.glow} flex-shrink-0`}>
            <Icon size={26} color="#fff" />
          </div>
          <div className="relative">
            <h1 className="text-white text-3xl font-extrabold tracking-tight">{theme.label}</h1>
            <p className="text-white/50 text-sm font-semibold mt-0.5">{allMoodSongs.length} songs · {theme.desc}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            type="text"
            placeholder={`Search in ${theme.label}...`}
            value={moodSearchQuery}
            onChange={e => setMoodSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.07] border border-white/8 focus:border-cyan-500/50 text-white placeholder-white/30 text-sm rounded-2xl pl-11 pr-10 py-3.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
          />
          {moodSearchQuery && (
            <button onClick={() => setMoodSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {songCount === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
            <Music2 size={48} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/40 font-medium">No songs match "{moodSearchQuery}" in {theme.label}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
            {moodFilteredAndSearchedSongs.map(song => <SongCard key={song?.id} song={song} />)}
          </div>
        )}
      </div>
    );
  }

  // ── 3. Default Library Grid ─────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-[140px]">
      <div>
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-300 font-extrabold text-3xl tracking-tight mb-1">
          Your Library
        </h1>
        <p className="text-white/40 text-sm font-medium">All your favourite tracks and moods in one place</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Liked Songs Card */}
        <button
          onClick={() => setActiveSection('favorites')}
          className="ripple-container group relative overflow-hidden rounded-3xl aspect-[16/9] flex flex-col justify-end p-6 border border-white/8 card-hover-lift text-left shadow-lg hover:shadow-rose-500/10 cursor-pointer"
        >
          <CoverCollage songs={likedSongs.slice(0,4)} albumCovers={albumCovers} />
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/20 to-pink-500/10 opacity-100 group-hover:opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/75 to-[#07070a]/30" />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center mb-3 shadow-lg shadow-rose-500/30">
              <Heart size={22} className="text-white fill-white" />
            </div>
            <h3 className="text-white text-xl font-extrabold tracking-tight">Liked Songs</h3>
            <p className="text-white/50 text-xs font-semibold mt-1 uppercase tracking-wider">{favorites.length} Tracks Saved</p>
          </div>
        </button>

        {/* Mood Cards */}
        {MASTER_MOODS.map(moodKey => {
          const theme = MOOD_THEMES[moodKey];
          const Icon = theme.icon;
          const moodSongs = allSongs.filter(s => s?.mood?.toLowerCase().trim().includes(moodKey));
          const count = moodSongs.length;

          return (
            <button
              key={moodKey}
              onClick={() => setSelectedMood(moodKey)}
              className={`ripple-container group relative overflow-hidden rounded-3xl aspect-[16/9] flex flex-col justify-end p-6 border border-white/8 card-hover-lift text-left shadow-lg ${theme.glow} cursor-pointer`}
            >
              <CoverCollage songs={moodSongs} albumCovers={albumCovers} />
              <div className={`absolute inset-0 bg-gradient-to-tr ${theme.grad} opacity-15 group-hover:opacity-25 transition-opacity duration-500`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/75 to-[#07070a]/30" />

              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${theme.grad} flex items-center justify-center mb-3 shadow-lg ${theme.glow}`}>
                  <Icon size={22} color="#fff" />
                </div>
                <h3 className="text-white text-xl font-extrabold tracking-tight">{theme.label}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{theme.desc}</p>
                  {count > 0 && (
                    <span className="text-[9px] text-white/30 font-bold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">{count}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
