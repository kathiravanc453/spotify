import { useMemo, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/shared/SongCard';
import SongRow from '../components/shared/SongRow';
import { SongCardSkeleton, SongRowSkeleton } from '../components/ui/Skeleton';
import { TrendingUp, Star, Clock, Music, Loader2, Music2, Heart, Zap, Coffee, Sparkles, Search, X, Play } from 'lucide-react';
import { cleanTitle } from '../utils/cleanTitle';

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
  const { recentlyPlayed = [], allSongs = [], loading = false, playSong, currentSong, playCounts = {}, albumCovers = {}, setActiveArtist, setActiveSection: setGlobalSection } = usePlayer() || {};
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

  // The real "Top Play" — the song with the highest play count, falls back to first song
  const topSong = useMemo(() => {
    if (allSongs.length === 0) return null;
    const withCounts = allSongs.filter(s => (playCounts[s.id] || 0) > 0);
    if (withCounts.length === 0) return allSongs[0];
    return withCounts.reduce((best, s) =>
      (playCounts[s.id] || 0) > (playCounts[best.id] || 0) ? s : best
    );
  }, [allSongs, playCounts]);  const MALE_ARTISTS = [
    "A.R. Rahman", "S.P. Balasubrahmanyam", "K. J. Yesudas", "T. M. Soundararajan", 
    "P. B. Srinivas", "Seerkazhi Govindarajan", "Malaysia Vasudevan", "Mano", 
    "Hariharan", "Unnikrishnan", "Srinivas", "Shankar Mahadevan", "Karthik", 
    "Haricharan", "Benny Dayal", "Naresh Iyer", "Vijay Yesudas", "Sid Sriram", 
    "Anirudh Ravichander", "Dhanush", "Sean Roldan", "S. P. Charan", "Ranjith", 
    "Javed Ali", "Sriram Parthasarathy"
  ];

  const FEMALE_ARTISTS = [
    "P. Susheela", "S. Janaki", "K. S. Chithra", "Sujatha Mohan", "Swarnalatha", 
    "Anuradha Sriram", "Harini", "Bombay Jayashri", "Shreya Ghoshal", "Chinmayi", 
    "Saindhavi", "Shweta Mohan", "Andrea Jeremiah", "Jonita Gandhi", "Dhee", 
    "Shakthisree Gopalan", "Mahalakshmi Iyer", "Shashaa Tirupati"
  ];

  const maleArtistsData = useMemo(() => {
    const counts = {};
    MALE_ARTISTS.forEach(artist => {
      counts[artist] = { count: 0, name: artist, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500' };
    });

    allSongs.forEach(song => {
      const rawName = song.artist && song.artist.trim() !== '' ? song.artist.trim() : 'Unknown Artist';
      const prefMatch = MALE_ARTISTS.find(p => rawName.toLowerCase().replace(/\s/g, '').includes(p.toLowerCase().replace(/\s/g, '')) || p.toLowerCase().replace(/\s/g, '').includes(rawName.toLowerCase().replace(/\s/g, '')));
      if (prefMatch) {
        counts[prefMatch].count++;
        if (counts[prefMatch].cover === 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500' && song.cover) {
           counts[prefMatch].cover = albumCovers[song.id] || song.cover;
        }
      }
    });
    
    return Object.values(counts).sort((a, b) => MALE_ARTISTS.indexOf(a.name) - MALE_ARTISTS.indexOf(b.name));
  }, [allSongs, albumCovers]);

  const femaleArtistsData = useMemo(() => {
    const counts = {};
    FEMALE_ARTISTS.forEach(artist => {
      counts[artist] = { count: 0, name: artist, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500' };
    });

    allSongs.forEach(song => {
      const rawName = song.artist && song.artist.trim() !== '' ? song.artist.trim() : 'Unknown Artist';
      const prefMatch = FEMALE_ARTISTS.find(p => rawName.toLowerCase().replace(/\s/g, '').includes(p.toLowerCase().replace(/\s/g, '')) || p.toLowerCase().replace(/\s/g, '').includes(rawName.toLowerCase().replace(/\s/g, '')));
      if (prefMatch) {
        counts[prefMatch].count++;
        if (counts[prefMatch].cover === 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500' && song.cover) {
           counts[prefMatch].cover = albumCovers[song.id] || song.cover;
        }
      }
    });
    
    return Object.values(counts).sort((a, b) => FEMALE_ARTISTS.indexOf(a.name) - FEMALE_ARTISTS.indexOf(b.name));
  }, [allSongs, albumCovers]);

  const topArtists = useMemo(() => {
    const counts = {};
    allSongs.forEach(song => {
      const artistName = song.artist && song.artist.trim() !== '' ? song.artist.trim() : 'Unknown Artist';
      if (!counts[artistName]) {
        counts[artistName] = { count: 0, name: artistName, cover: albumCovers[song.id] || song.cover };
      }
      counts[artistName].count++;
    });
    
    return Object.values(counts)
      .filter(artist => !MALE_ARTISTS.includes(artist.name) && !FEMALE_ARTISTS.includes(artist.name)) // Hide predefined artists from the general popular list to avoid duplication
      .sort((a, b) => b.count - a.count);
  }, [allSongs, albumCovers]);
  
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
      const trendingSongs = allSongs.slice(0, 20); // Show more trending
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
        if (s.mood) moodCounts[s.mood.trim()] = (moodCounts[s.mood.trim()] || 0) + 1;
      });
      let favoriteMood = null, maxCount = 0;
      Object.entries(moodCounts).forEach(([mood, count]) => {
        if (count > maxCount) { maxCount = count; favoriteMood = mood; }
      });

      // Mood-matched songs not yet played
      let moodSongs = favoriteMood
        ? allSongs.filter(s => s.mood?.toLowerCase().trim() === favoriteMood.toLowerCase().trim() && !playedIds.has(s.id))
        : [];
      if (moodSongs.length < 5) {
        allSongs.filter(s => !playedIds.has(s.id)).forEach(s => {
          if (moodSongs.length < 12 && !moodSongs.find(r => r.id === s.id)) moodSongs.push(s);
        });
      }
      if (moodSongs.length === 0) moodSongs = allSongs.slice(0, 12);

      // New arrivals — last 7 days
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const newArrivals = [...allSongs]
        .sort((a,b) => new Date(b.uploadedAt||0) - new Date(a.uploadedAt||0))
        .filter(s => new Date(s.uploadedAt||0).getTime() > sevenDaysAgo)
        .slice(0, 10);

      const featuredTrack = moodSongs[0] || allSongs[0];
      const suggestionRow  = moodSongs.slice(1, 9);

      const moodGradients = {
        love: 'from-rose-900/70 via-pink-900/40 to-transparent',
        melody: 'from-cyan-900/70 via-blue-900/40 to-transparent',
        romance: 'from-fuchsia-900/70 via-rose-900/40 to-transparent',
        vibes: 'from-amber-900/70 via-orange-900/40 to-transparent',
        'energy boost': 'from-violet-900/70 via-indigo-900/40 to-transparent',
      };
      const moodGrad = moodGradients[favoriteMood?.toLowerCase()] || 'from-cyan-900/60 via-violet-900/40 to-transparent';

      return (
        <section className="space-y-10 animate-in fade-in duration-300">
          {/* Header */}
          <div>
            <h2 className="text-white text-3xl font-extrabold tracking-tight mb-1">Recommended</h2>
            <p className="text-white/40 text-sm font-medium">
              {favoriteMood
                ? `✨ Based on your love for "${favoriteMood}" music`
                : 'Personalized suggestions based on your listening taste'}
            </p>
          </div>

          {/* ── Featured Track Hero Card ──────────────────────────────── */}
          {featuredTrack && (
            <div
              className="relative rounded-3xl overflow-hidden cursor-pointer group"
              onClick={() => playSong(featuredTrack)}
              style={{ minHeight: '200px' }}
            >
              {/* Blurred background art */}
              <div
                className="absolute inset-0 bg-cover bg-center scale-110 transition-transform duration-[8000ms] group-hover:scale-125"
                style={{
                  backgroundImage: `url(${albumCovers[featuredTrack.id] || featuredTrack.cover})`,
                  filter: 'blur(28px) brightness(0.45)'
                }}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${moodGrad}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07070a]/80 via-transparent to-transparent" />

              {/* Content */}
              <div className="relative z-10 flex items-center gap-5 p-6 md:p-8">
                {/* Album Art */}
                <div className="relative flex-shrink-0 w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={albumCovers[featuredTrack.id] || featuredTrack.cover}
                    alt={featuredTrack.title}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500'; }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play size={28} fill="#fff" color="#fff" className="ml-1 drop-shadow-lg" />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full mb-3">
                    🎯 Featured For You
                  </span>
                  <h3 className="text-white text-xl md:text-3xl font-extrabold tracking-tight leading-tight truncate">
                    {cleanTitle(featuredTrack.title)}
                  </h3>
                  <p className="text-white/60 text-sm font-semibold mt-1 truncate">{featuredTrack.artist}</p>
                  {featuredTrack.mood && (
                    <span className="mt-2 inline-block text-[10px] font-bold uppercase text-violet-400 bg-violet-950/40 border border-violet-800/20 px-2.5 py-0.5 rounded-full">
                      {featuredTrack.mood}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Based On Your Taste — horizontal scroll ───────────────── */}
          {suggestionRow.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-bold tracking-tight">Based on Your Taste</h3>
                <span className="text-white/30 text-xs font-semibold">{suggestionRow.length} songs</span>
              </div>
              <div className="flex gap-4 overflow-x-auto scroll-snap-x scrollbar-none pb-2">
                {suggestionRow.map((song, i) => {
                  const cover = albumCovers[song.id] || song.cover;
                  return (
                    <div
                      key={song.id}
                      onClick={() => playSong(song)}
                      className="ripple-container flex-shrink-0 w-40 cursor-pointer group scroll-snap-x"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-lg mb-2 bg-white/5">
                        <img
                          src={cover}
                          alt={song.title}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500'; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play size={22} fill="#fff" color="#fff" className="ml-0.5" />
                        </div>
                      </div>
                      <p className="text-white text-xs font-bold truncate px-0.5">{cleanTitle(song.title)}</p>
                      <p className="text-white/40 text-[10px] truncate px-0.5 mt-0.5">{song.artist}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── New Arrivals (last 7 days) ────────────────────────────── */}
          {newArrivals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h3 className="text-white text-lg font-bold tracking-tight">New Arrivals</h3>
                <span className="text-white/30 text-xs font-semibold">Last 7 days</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {newArrivals.map(song => <SongCard key={song.id} song={song} />)}
              </div>
            </div>
          )}

          {/* ── Made For You grid ─────────────────────────────────────── */}
          <div>
            <SectionHeader icon={Sparkles} title="Made For You" gradient="from-cyan-400 to-violet-500 shadow-cyan-500/20" />
            {moodSongs.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
                <p className="text-white/30 font-medium">Add some songs to Cloudinary to view recommendations!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
                {moodSongs.map(song => <SongCard key={song.id} song={song} />)}
              </div>
            )}
          </div>
        </section>
      );
    }

    const renderArtistCarousel = (title, artistsList) => {
      if (!artistsList || artistsList.length === 0) return null;
      return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl font-bold tracking-tight">{title}</h2>
            <button className="text-white/60 hover:text-white text-sm font-semibold transition-colors">Show all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto scroll-snap-x scrollbar-none pb-4">
            {artistsList.map(artist => (
              <div 
                key={artist.name} 
                className="group cursor-pointer flex-shrink-0 w-44 sm:w-48 scroll-snap-x p-4 rounded-xl hover:bg-white/[0.08] transition-colors duration-300"
                style={{ scrollSnapAlign: 'start' }}
                onClick={() => {
                  setActiveArtist(artist.name);
                  setGlobalSection('artist');
                }}
              >
                <div className="relative aspect-square rounded-full overflow-hidden mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <img src={artist.cover} alt={artist.name} className="w-full h-full object-cover" />
                  <div className="absolute right-2 bottom-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <div className="w-12 h-12 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-105 flex items-center justify-center shadow-xl">
                      <Play size={24} fill="#000" color="#000" className="ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="text-white text-base font-bold truncate">{artist.name}</h3>
                <p className="text-[#a7a7a7] text-sm mt-1">Artist</p>
              </div>
            ))}
          </div>
        </section>
      );
    };

    // Default Home view
    return (
      <>
        {topSong && (
          <div
            className="relative rounded-3xl overflow-hidden h-48 md:h-64 shadow-2xl border border-white/5 group/banner cursor-pointer"
            onClick={() => playSong(topSong)}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] group-hover/banner:scale-105"
              style={{ backgroundImage: `url(${albumCovers[topSong.id] || topSong.cover}), url(${topSong.fallbackCover})`, filter: 'blur(1px) brightness(0.35)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07070a] via-[#07070a]/60 to-transparent" />
            <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-10">
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2 bg-cyan-950/40 border border-cyan-800/30 px-3 py-1 rounded-full w-fit">
                🔥 Top Play{playCounts[topSong.id] ? ` · ${playCounts[topSong.id]} plays` : ''}
              </span>
              <h1 className="text-white text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">{topSong.title}</h1>
              <p className="text-white/70 text-sm md:text-base mt-2 font-medium">{topSong.artist}</p>
            </div>
          </div>
        )}
 
        {recentlyPlayed.length > 0 && (
          <section>
            <SectionHeader icon={Clock} title="Recently Played" gradient="from-blue-400 to-indigo-500 shadow-blue-500/20" />
            <div className="flex flex-col gap-2">
              {recentlyPlayed.slice(0, 10).map((song, i) => <SongRow key={song?.id || i} song={song} index={i} />)}
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


        {renderArtistCarousel('Male Artists', maleArtistsData)}
        {renderArtistCarousel('Female Artists', femaleArtistsData)}
        {renderArtistCarousel('Popular Artists', topArtists)}

        <section>
          <SectionHeader icon={Music} title="Your Library" gradient="from-violet-500 to-fuchsia-500 shadow-violet-500/20" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {allSongs.map(song => <SongCard key={song?.id} song={song} />)}
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
