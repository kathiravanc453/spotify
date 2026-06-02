import { useMemo, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/shared/SongCard';
import SongRow from '../components/shared/SongRow';
import { SongCardSkeleton, SongRowSkeleton } from '../components/ui/Skeleton';
import { TrendingUp, Star, Clock, Music, Loader2, Music2, Heart, Zap, Coffee, Sparkles, Search, X } from 'lucide-react';

// YOUR 5 MASTER CATEGORIES
const MASTER_MOODS = ['love', 'melody', 'romance', 'vibes', 'energy boost'];

const MOOD_THEMES = {
  'love': { label: 'Love', icon: Heart, color: 'from-rose-500 to-pink-500 shadow-rose-500/25 text-white' },
  'melody': { label: 'Melody', icon: Sparkles, color: 'from-cyan-500 to-blue-500 shadow-cyan-500/25 text-white' },
  'romance': { label: 'Romance', icon: Heart, color: 'from-fuchsia-500 to-rose-400 shadow-fuchsia-500/25 text-white' },
  'romances': { label: 'Romance', icon: Heart, color: 'from-fuchsia-500 to-rose-400 shadow-fuchsia-500/25 text-white' },
  'vibes': { label: 'Vibes', icon: Coffee, color: 'from-amber-500 to-orange-500 shadow-orange-500/25 text-white' },
  'energy boost': { label: 'Energy Boost', icon: Zap, color: 'from-violet-600 to-indigo-500 shadow-violet-500/25 text-white' },
  'boost energy': { label: 'Energy Boost', icon: Zap, color: 'from-violet-600 to-indigo-500 shadow-violet-500/25 text-white' },
};

function SectionHeader({ icon: Icon, title, gradient }) {
  if (!Icon) return null;
  const bgClass = gradient.includes('from-') ? `bg-gradient-to-tr ${gradient}` : gradient;
  return (
    <div className="flex items-center gap-3.5 mb-6">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgClass} shadow-md`}>
        <Icon size={16} color="#fff" />
      </div>
      <h2 className="text-white text-xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

export default function Home({ search = '', activeSection = 'home' }) {
  const { recentlyPlayed = [], allSongs = [], loading = false, playSong, currentSong } = usePlayer() || {};
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodSearch, setMoodSearch] = useState('');

  // Dynamic recommendation based on the currently playing song (reusing upNextQueue to avoid duplicating expensive filtering logic)
  const relatedSongs = usePlayer()?.upNextQueue?.slice(0, 5) || [];
 
  const filteredByMoodAndSearch = useMemo(() => {
    if (!selectedMood) return [];
    const base = allSongs.filter(s => s.mood?.toLowerCase().trim().includes(selectedMood));
    if (!moodSearch.trim()) return base;
    return base.filter(s =>
      s.title?.toLowerCase().includes(moodSearch.toLowerCase()) ||
      s.artist?.toLowerCase().includes(moodSearch.toLowerCase())
    );
  }, [selectedMood, allSongs, moodSearch]);
 
  const trending = useMemo(() => allSongs.filter(s => s?.trending), [allSongs]);
 
  if (loading && allSongs.length === 0) {
    return (
      <div className="p-6 md:p-8 space-y-10">
        {/* Skeleton for featured cards */}
        <div>
          <div className="h-5 w-36 bg-white/[0.06] rounded-full mb-6 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SongCardSkeleton key={i} />)}
          </div>
        </div>
        {/* Skeleton for song rows */}
        <div>
          <div className="h-5 w-48 bg-white/[0.06] rounded-full mb-6 animate-pulse" />
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => <SongRowSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }
 
  const renderSectionContent = () => {
    // Search query results view
    if (search.trim()) {
      const results = allSongs.filter(s => 
        s.title?.toLowerCase().includes(search.toLowerCase()) || 
        s.artist?.toLowerCase().includes(search.toLowerCase()) ||
        s.mood?.toLowerCase().includes(search.toLowerCase())
      );
      return (
        <section className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-2xl font-bold tracking-tight">Search Results for "{search}"</h2>
            <span className="text-white/40 text-sm font-medium">{results.length} found</span>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
              <p className="text-white/30 font-medium">No matches found for "{search}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map(song => <SongCard key={song.id} song={song} />)}
            </div>
          )}
        </section>
      );
    }
 
    if (activeSection === 'search') {
      return (
        <section className="space-y-8 animate-in fade-in duration-300">
          <div>
            <h2 className="text-white text-3xl font-extrabold tracking-tight mb-2">Search</h2>
            <p className="text-white/40 text-sm">Find music for any mood</p>
          </div>
          
          <div>
            <SectionHeader icon={Music2} title="Browse All Moods" gradient="from-cyan-400 to-violet-500 shadow-cyan-500/20" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {MASTER_MOODS.map(moodKey => {
                const theme = MOOD_THEMES[moodKey];
                const Icon = theme.icon;
                return (
                  <button
                    key={moodKey}
                    onClick={() => setSelectedMood(moodKey)}
                    className="relative overflow-hidden rounded-2xl aspect-square flex flex-col justify-end p-5 border border-white/5 transition-all duration-300 hover:scale-[1.03] text-left group shadow-lg hover:shadow-black/30"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-tr ${theme.color} opacity-10 transition-opacity group-hover:opacity-20`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/40 to-transparent" />
                    <div className="relative z-10">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${theme.color} flex items-center justify-center mb-3 shadow`}>
                        <Icon size={18} color="#fff" />
                      </div>
                      <h3 className="text-white text-lg font-bold tracking-tight capitalize">{theme.label}</h3>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      );
    }
 
    if (activeSection === 'trending') {
      const trendingSongs = allSongs.slice(0, 5);
      return (
        <section className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-white text-3xl font-extrabold tracking-tight mb-2">Trending Charts</h2>
            <p className="text-white/40 text-sm font-medium">The most played tracks right now</p>
          </div>
          
          {trendingSongs.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
              <p className="text-white/30 font-medium">No trending songs synced yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {trendingSongs.map((song, i) => (
                <SongRow key={song.id} song={song} index={i} />
              ))}
            </div>
          )}
        </section>
      );
    }
 
    if (activeSection === 'recommended') {
      const playedIds = new Set(recentlyPlayed.map(s => s.id));
      const moodCounts = {};
      recentlyPlayed.forEach(s => {
        if (s.mood) {
          const m = s.mood.trim();
          moodCounts[m] = (moodCounts[m] || 0) + 1;
        }
      });
      
      let favoriteMood = null;
      let maxCount = 0;
      Object.entries(moodCounts).forEach(([mood, count]) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteMood = mood;
        }
      });
 
      let recommendedSongs = [];
      if (favoriteMood) {
        recommendedSongs = allSongs.filter(s => 
          s.mood?.toLowerCase().trim() === favoriteMood.toLowerCase().trim() && 
          !playedIds.has(s.id)
        );
      }
      
      if (recommendedSongs.length < 5) {
        const unplayedSongs = allSongs.filter(s => !playedIds.has(s.id));
        unplayedSongs.forEach(s => {
          if (recommendedSongs.length < 10 && !recommendedSongs.find(r => r.id === s.id)) {
            recommendedSongs.push(s);
          }
        });
      }
 
      if (recommendedSongs.length === 0) {
        recommendedSongs = allSongs;
      }
 
      const sortedSongs = [...allSongs].sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
      const newDiscovery = sortedSongs[0];
 
      return (
        <section className="space-y-10 animate-in fade-in duration-300">
          <div>
            <h2 className="text-white text-3xl font-extrabold tracking-tight mb-2">Recommended</h2>
            <p className="text-white/40 text-sm font-medium">
              {favoriteMood 
                ? `Based on your recent love for "${favoriteMood}" music` 
                : 'Personalized suggestions based on your listening taste'}
            </p>
          </div>
 
          {newDiscovery && (
            <div className="bg-gradient-to-r from-cyan-950/30 to-violet-950/20 border border-cyan-500/10 rounded-3xl p-5 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[150%] rounded-full bg-gradient-to-l from-cyan-500/10 to-violet-500/0 blur-[80px] pointer-events-none" />
              
              <div className="relative w-36 h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
                <img 
                  src={newDiscovery.cover} 
                  alt={newDiscovery.title} 
                  onError={(e) => {
                    if (newDiscovery.fallbackCover && e.target.src !== newDiscovery.fallbackCover) {
                      e.target.src = newDiscovery.fallbackCover;
                    } else {
                      e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
 
              <div className="flex-1 text-center md:text-left space-y-3 z-10">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 text-xs font-bold uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-3 py-1 rounded-full w-fit">
                  NEW DISCOVERY
                </span>
                <div>
                  <h3 className="text-white text-2xl font-extrabold tracking-tight truncate max-w-lg">{newDiscovery.title}</h3>
                  <p className="text-white/60 text-sm mt-1 font-semibold">{newDiscovery.artist} • <span className="text-cyan-400">{newDiscovery.mood}</span></p>
                </div>
                <button 
                  onClick={() => playSong(newDiscovery)}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/10 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Listen Now
                </button>
              </div>
            </div>
          )}
 
          <div>
            <SectionHeader icon={Sparkles} title="Made For You" gradient="from-cyan-400 to-violet-500 shadow-cyan-500/20" />
            
            {recommendedSongs.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
                <p className="text-white/30 font-medium">Add some songs to Cloudinary to view recommendations!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {recommendedSongs.map(song => (
                  <SongCard key={song.id} song={song} />
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }
 
    // Default Home view
    return (
      <>
        {allSongs[0] && (
          <div className="relative rounded-3xl overflow-hidden h-48 md:h-64 shadow-2xl border border-white/5 group/banner">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] group-hover/banner:scale-105" style={{ backgroundImage: `url(${allSongs[0]?.cover}), url(${allSongs[0]?.fallbackCover})`, filter: 'blur(1px) brightness-0.35)' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07070a] via-[#07070a]/60 to-transparent" />
            <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-10">
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2 bg-cyan-950/40 border border-cyan-800/30 px-3 py-1 rounded-full w-fit">Top Play</span>
              <h1 className="text-white text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">{allSongs[0]?.title}</h1>
              <p className="text-white/70 text-sm md:text-base mt-2 font-medium">{allSongs[0]?.artist}</p>
            </div>
          </div>
        )}
 
        {recentlyPlayed.length > 0 && (
          <section>
            <SectionHeader icon={Clock} title="Recently Played" gradient="from-blue-400 to-indigo-500 shadow-blue-500/20" />
            <div className="flex flex-col gap-2">
              {recentlyPlayed.slice(0, 4).map((song, i) => <SongRow key={song?.id || i} song={song} index={i} />)}
            </div>
          </section>
        )}
 
        {currentSong && relatedSongs.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionHeader icon={Sparkles} title={`More like "${currentSong.title}"`} gradient="from-cyan-400 to-violet-500 shadow-cyan-500/20" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {relatedSongs.map(song => <SongCard key={song.id} song={song} />)}
            </div>
          </section>
        )}
 
        <section>
          <SectionHeader icon={Music} title="Your Library" gradient="from-violet-500 to-fuchsia-500 shadow-violet-500/20" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {allSongs.slice(0, 10).map(song => <SongCard key={song?.id} song={song} />)}
          </div>
        </section>
      </>
    );
  };
 
  return (
    <div className="p-4 md:p-8 space-y-12">
      {/* Mood Selector at the Top - Only shown on Home/Search sections when no active search query is entered */}
      {(activeSection === 'home' || activeSection === 'search') && !search && (
        <section>
          <SectionHeader icon={Music2} title="How are you feeling?" gradient="from-cyan-400 to-violet-500 shadow-cyan-500/20" />
          <div className="flex overflow-x-auto gap-3 pb-3 snap-x scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
            <button
              onClick={() => setSelectedMood(null)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 snap-start ${!selectedMood ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/20 scale-105' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              All Music
            </button>
            {MASTER_MOODS.map(moodKey => {
              const theme = MOOD_THEMES[moodKey];
              const Icon = theme.icon;
              const isSelected = selectedMood === moodKey;
              return (
                <button
                  key={moodKey}
                  onClick={() => setSelectedMood(moodKey)}
                  className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 snap-start
                    ${isSelected ? `bg-gradient-to-r ${theme.color} scale-105 shadow-lg` : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                  <Icon size={16} />
                  {theme.label}
                </button>
              );
            })}
          </div>
        </section>
      )}
 
      {selectedMood ? (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-white text-2xl font-bold tracking-tight">Best of {MOOD_THEMES[selectedMood]?.label}</h2>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Mood Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <input
                  type="text"
                  placeholder={`Search in ${MOOD_THEMES[selectedMood]?.label}...`}
                  value={moodSearch}
                  onChange={(e) => setMoodSearch(e.target.value)}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.06] border border-white/5 focus:border-cyan-500/50 text-white placeholder-white/30 text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
                />
                {moodSearch && (
                  <button
                    onClick={() => setMoodSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => { setSelectedMood(null); setMoodSearch(''); }}
                className="text-cyan-400 text-sm font-bold hover:underline transition-all flex-shrink-0 cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          </div>
          {filteredByMoodAndSearch.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
                <p className="text-white/30 font-medium">No songs match your search in {MOOD_THEMES[selectedMood]?.label}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredByMoodAndSearch.map(song => <SongCard key={song?.id} song={song} />)}
            </div>
          )}
        </section>
      ) : (
        renderSectionContent()
      )}
    </div>
  );
}
