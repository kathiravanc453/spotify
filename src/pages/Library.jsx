import { useMemo, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/shared/SongCard';
import SongRow from '../components/shared/SongRow';
import { Heart, Zap, Coffee, Sparkles, Music2, ChevronLeft, Music, Search, X } from 'lucide-react';
 
const MASTER_MOODS = ['love', 'melody', 'romance', 'vibes', 'energy boost'];
 
const MOOD_THEMES = {
  'love': { label: 'Love', icon: Heart, color: 'from-rose-500 to-pink-500', desc: 'Deeply in Love' },
  'melody': { label: 'Melody', icon: Sparkles, color: 'from-cyan-500 to-blue-500', desc: 'Pure musical bliss' },
  'romance': { label: 'Romance', icon: Heart, color: 'from-fuchsia-500 to-rose-400', desc: 'Sweet & Romantic' },
  'vibes': { label: 'Vibes', icon: Coffee, color: 'from-amber-500 to-orange-500', desc: 'Chill & Relax' },
  'energy boost': { label: 'Energy Boost', icon: Zap, color: 'from-violet-600 to-indigo-500', desc: 'Power up your day' },
};
 
export default function Library() {
  const { allSongs = [], favorites = [], activeSection, setActiveSection } = usePlayer() || {};
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSearchQuery, setMoodSearchQuery] = useState('');

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

  const likedSongs = useMemo(() => {
    return allSongs.filter(s => favorites.includes(s.id));
  }, [favorites, allSongs]);
 
  // 1. Liked Songs List View
  if (showLiked) {
    return (
      <div className="p-4 md:p-8 animate-in fade-in slide-in-from-left-4 duration-300">
        <button 
          onClick={() => setActiveSection('library')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors font-semibold text-sm cursor-pointer"
        >
          <ChevronLeft size={16} />
          Back to Library
        </button>
        
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Heart size={26} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-white text-3xl font-extrabold tracking-tight">Liked Songs</h1>
            <p className="text-white/40 text-sm font-medium">{likedSongs.length} songs saved</p>
          </div>
        </div>
 
        {likedSongs.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
            <Heart size={44} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/40 font-medium">No liked songs yet. Click the heart icon on any song to add it here!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {likedSongs.map((song, idx) => (
              <SongRow key={song?.id} song={song} index={idx} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. Mood Filtered Songs View
  if (selectedMood) {
    const theme = MOOD_THEMES[selectedMood] || { label: selectedMood, icon: Music, color: 'from-purple-500 to-indigo-500' };
    return (
      <div className="p-4 md:p-8 animate-in fade-in slide-in-from-left-4 duration-300">
        <button 
          onClick={() => { setSelectedMood(null); setMoodSearchQuery(''); }}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors font-semibold text-sm cursor-pointer"
        >
          <ChevronLeft size={16} />
          Back to Moods
        </button>
        
        <div className="mb-6">
          <h1 className="text-white text-3xl font-extrabold tracking-tight mb-2">{theme.label}</h1>
          <p className="text-white/40 text-sm font-medium">{moodFilteredAndSearchedSongs.length} songs found</p>
        </div>

        {/* Mood Inner Search Bar */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input
            type="text"
            placeholder={`Search songs in ${theme.label}...`}
            value={moodSearchQuery}
            onChange={(e) => setMoodSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.06] border border-white/5 focus:border-cyan-500/50 text-white placeholder-white/30 text-sm rounded-2xl pl-11 pr-10 py-3.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
          />
          {moodSearchQuery && (
            <button
              onClick={() => setMoodSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
 
        {moodFilteredAndSearchedSongs.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
            <Music2 size={48} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/40 font-medium">No songs match your search inside {theme.label}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {moodFilteredAndSearchedSongs.map(song => <SongCard key={song?.id} song={song} />)}
          </div>
        )}
      </div>
    );
  }
 
  // 3. Default Library Grid View
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-300 font-extrabold text-3xl tracking-tight mb-2">
          Your Library
        </h1>
        <p className="text-white/45 text-sm font-medium">All your favorite tracks and moods in one place</p>
      </div>
 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Liked Songs Card */}
        <button
          onClick={() => setActiveSection('favorites')}
          className="group relative overflow-hidden rounded-3xl aspect-[16/9] flex flex-col justify-end p-6 border border-white/5 transition-all duration-500 hover:scale-[1.02] hover:border-white/15 active:scale-95 text-left shadow-lg hover:shadow-black/40 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-600 to-pink-500 opacity-10 transition-opacity group-hover:opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/65 to-transparent" />
          
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/20">
              <Heart size={22} className="text-white fill-white" />
            </div>
            <h3 className="text-white text-2xl font-bold tracking-tight">Liked Songs</h3>
            <p className="text-white/50 text-xs font-semibold mt-1 tracking-wide uppercase">{favorites.length} Tracks Saved</p>
          </div>
        </button>

        {/* Mood Selection Cards */}
        {MASTER_MOODS.map(moodKey => {
          const theme = MOOD_THEMES[moodKey];
          const Icon = theme.icon;
          return (
            <button
              key={moodKey}
              onClick={() => setSelectedMood(moodKey)}
              className="group relative overflow-hidden rounded-3xl aspect-[16/9] flex flex-col justify-end p-6 border border-white/5 transition-all duration-500 hover:scale-[1.02] hover:border-white/15 active:scale-95 text-left shadow-lg hover:shadow-black/40 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-tr ${theme.color} opacity-10 transition-opacity group-hover:opacity-20" style={{ backgroundImage: `linear-gradient(to top right, var(--tw-gradient-stops))` }} />
              <div className={`absolute inset-0 bg-gradient-to-tr ${theme.color} opacity-10 transition-opacity group-hover:opacity-20`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/65 to-transparent" />
              
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${theme.color} flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/10`}>
                  <Icon size={22} color="#fff" />
                </div>
                <h3 className="text-white text-2xl font-bold tracking-tight">{theme.label}</h3>
                <p className="text-white/50 text-xs font-semibold mt-1 tracking-wide uppercase">{theme.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
