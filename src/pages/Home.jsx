import { useMemo, useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/shared/SongCard';
import SongRow from '../components/shared/SongRow';
import { SongCardSkeleton, SongRowSkeleton } from '../components/ui/Skeleton';
import { TrendingUp, Star, Clock, Music, Loader2, Music2, Heart, Zap, Coffee, Sparkles, Search, X, Play } from 'lucide-react';
import { cleanTitle, splitArtists } from '../utils/cleanTitle';
import artistImages from '../data/artistImages.json';
import { CloudRain } from 'lucide-react'; // Added for Sad mood
// YOUR 5 MASTER CATEGORIES
const MASTER_MOODS = ['kuthu', 'romance', 'melody', 'sad', 'vibes'];

const MOOD_THEMES = {
  'kuthu': { label: 'Kuthu', icon: Zap, color: 'from-violet-600 to-indigo-500 shadow-violet-500/25 text-white' },
  'romance': { label: 'Romance', icon: Heart, color: 'from-fuchsia-500 to-rose-400 shadow-fuchsia-500/25 text-white' },
  'melody': { label: 'Melody', icon: Sparkles, color: 'from-cyan-500 to-blue-500 shadow-cyan-500/25 text-white' },
  'sad': { label: 'Sad', icon: CloudRain, color: 'from-slate-600 to-gray-500 shadow-slate-500/25 text-white' },
  'vibes': { label: 'Vibes', icon: Coffee, color: 'from-amber-500 to-orange-500 shadow-orange-500/25 text-white' },
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

export default function Home({ search = '', setSearch, activeSection = 'home' }) {
  const { recentlyPlayed = [], allSongs = [], loading = false, playSong, currentSong, playCounts = {}, albumCovers = {}, setActiveArtist, setActiveActor, setActiveSection: setGlobalSection, saavnResults = [], saavnLoading = false, searchSaavnGlobal, saavnHomeData = { trending: [], playlists: [] }, saavnHomeLoading = false } = usePlayer() || {};

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.trim() !== '') {
        searchSaavnGlobal(search);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);
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

  const POPULAR_ACTORS = [
    "Vijay", "Ajith Kumar", "Suriya", "Vikram", "Dhanush", 
    "Vijay Sethupathi", "Sivakarthikeyan", "Karthi", 
    "Rajinikanth", "Kamal Haasan", "Sivaji Ganesan", 
    "M. G. Ramachandran", "Gemini Ganesan", "Jaishankar",
    "Arya", "Jayam Ravi", "Jiiva", "Vishal", "Silambarasan", 
    "Atharvaa", "Bharath", "Shaam", "Prashanth", "Arvind Swamy", "Madhavan"
  ];

  const ACTOR_IMAGES = {
    "Vijay": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/C._Joseph_Vijay_%28cropped%29.jpg/500px-C._Joseph_Vijay_%28cropped%29.jpg",
    "Ajith Kumar": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Ajith_Kumar_at_Irungattukottai_Race_Track.jpg/500px-Ajith_Kumar_at_Irungattukottai_Race_Track.jpg",
    "Suriya": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Retro_audio_launch_-_Suriya.jpg/500px-Retro_audio_launch_-_Suriya.jpg",
    "Vikram": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Tamil-Actor-Vikram-Looking-Very-Smart-And-Stylish-Photos-20.jpg/500px-Tamil-Actor-Vikram-Looking-Very-Smart-And-Stylish-Photos-20.jpg",
    "Dhanush": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Dhanush_at_the_%E2%80%98Asuran%E2%80%99_Success_Meet_%28cropped%29.jpg/500px-Dhanush_at_the_%E2%80%98Asuran%E2%80%99_Success_Meet_%28cropped%29.jpg",
    "Vijay Sethupathi": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Vijay_Sethupathi.jpg/500px-Vijay_Sethupathi.jpg",
    "Sivakarthikeyan": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Sivakarthikeyan_%28cropped%29.jpg/500px-Sivakarthikeyan_%28cropped%29.jpg",
    "Karthi": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Karthi_Sivakumar_at_Nenjil_Thunivirunthal_Audio_Launch_%28cropped%29.jpg/500px-Karthi_Sivakumar_at_Nenjil_Thunivirunthal_Audio_Launch_%28cropped%29.jpg",
    "Rajinikanth": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Rajinikanth_in_2019.jpg/500px-Rajinikanth_in_2019.jpg",
    "Kamal Haasan": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Kamal_Haasan_at_2023_San_Diego_Comic-Con_International_by_Gage_Skidmore%2C_005_%28cropped%29.jpg/500px-Kamal_Haasan_at_2023_San_Diego_Comic-Con_International_by_Gage_Skidmore%2C_005_%28cropped%29.jpg",
    "Sivaji Ganesan": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Sivaji_ganesan_%28cropped%29.jpg/500px-Sivaji_ganesan_%28cropped%29.jpg",
    "M. G. Ramachandran": "https://upload.wikimedia.org/wikipedia/commons/4/44/MGR_portrait%2C_from_2017_Stamp.jpg",
    "Gemini Ganesan": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Gemini_Ganesan_2006_stamp_of_India_%28cropped%29.jpg",
    "Arya": "https://upload.wikimedia.org/wikipedia/commons/5/58/Arya_viewing_CCL_match%2C_India_%28cropped%29.jpg",
    "Jayam Ravi": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Jayam_Ravi_at_Naya_Gadget_Shop_Launch_Event.jpg/500px-Jayam_Ravi_at_Naya_Gadget_Shop_Launch_Event.jpg",
    "Jiiva": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Jiiva_latest_photoshoot.jpg/500px-Jiiva_latest_photoshoot.jpg",
    "Vishal": "https://upload.wikimedia.org/wikipedia/commons/8/86/Vishal_at_CCL_4_Launch_%28cropped%29.jpg",
    "Silambarasan": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Simbu_At_The_Inimey_Ippadithaan_Audio_Launch_%28cropped%29.jpg/500px-Simbu_At_The_Inimey_Ippadithaan_Audio_Launch_%28cropped%29.jpg",
    "Atharvaa": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Atharvaa_at_Eetti_Success_Meet_%28cropped%29.jpg/500px-Atharvaa_at_Eetti_Success_Meet_%28cropped%29.jpg",
    "Bharath": "https://ui-avatars.com/api/?name=Bharath&background=random&color=fff",
    "Shaam": "https://ui-avatars.com/api/?name=Shaam&background=random&color=fff",
    "Prashanth": "https://ui-avatars.com/api/?name=Prashanth&background=random&color=fff",
    "Arvind Swamy": "https://ui-avatars.com/api/?name=Arvind%20Swamy&background=random&color=fff",
    "Madhavan": "https://ui-avatars.com/api/?name=Madhavan&background=random&color=fff"
  };

  const FEMALE_ARTISTS = [
    "P. Susheela", "S. Janaki", "K. S. Chithra", "Sujatha Mohan", "Swarnalatha", 
    "Anuradha Sriram", "Harini", "Bombay Jayashri", "Shreya Ghoshal", "Chinmayi", 
    "Saindhavi", "Shweta Mohan", "Andrea Jeremiah", "Jonita Gandhi", "Dhee", 
    "Shakthisree Gopalan", "Mahalakshmi Iyer", "Shashaa Tirupati"
  ];

  const maleArtistsData = useMemo(() => {
    const counts = {};
    MALE_ARTISTS.forEach(artist => {
      const cleanName = artist.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
      counts[artist] = { 
        count: 0, 
        name: artist, 
        cover: artistImages[artist] || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=random&color=fff&size=500&font-size=0.33`
      };
    });

    allSongs.forEach(song => {
      const rawName = song.artist && song.artist.trim() !== '' ? song.artist.trim() : 'Unknown Artist';
      const prefMatch = MALE_ARTISTS.find(p => rawName.toLowerCase().replace(/\s/g, '').includes(p.toLowerCase().replace(/\s/g, '')) || p.toLowerCase().replace(/\s/g, '').includes(rawName.toLowerCase().replace(/\s/g, '')));
      if (prefMatch) {
        counts[prefMatch].count++;
        // If they don't have a Wiki image, use the song cover instead of the UI Avatar
        if (!artistImages[prefMatch] && counts[prefMatch].cover.includes('ui-avatars.com') && song.cover) {
           counts[prefMatch].cover = albumCovers[song.id] || song.cover;
        }
      }
    });
    
    return Object.values(counts).sort((a, b) => MALE_ARTISTS.indexOf(a.name) - MALE_ARTISTS.indexOf(b.name));
  }, [allSongs, albumCovers]);

  const femaleArtistsData = useMemo(() => {
    const counts = {};
    FEMALE_ARTISTS.forEach(artist => {
      const cleanName = artist.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
      counts[artist] = { 
        count: 0, 
        name: artist, 
        cover: artistImages[artist] || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=random&color=fff&size=500&font-size=0.33`
      };
    });

    allSongs.forEach(song => {
      const rawName = song.artist && song.artist.trim() !== '' ? song.artist.trim() : 'Unknown Artist';
      const prefMatch = FEMALE_ARTISTS.find(p => rawName.toLowerCase().replace(/\s/g, '').includes(p.toLowerCase().replace(/\s/g, '')) || p.toLowerCase().replace(/\s/g, '').includes(rawName.toLowerCase().replace(/\s/g, '')));
      if (prefMatch) {
        counts[prefMatch].count++;
        if (!artistImages[prefMatch] && counts[prefMatch].cover.includes('ui-avatars.com') && song.cover) {
           counts[prefMatch].cover = albumCovers[song.id] || song.cover;
        }
      }
    });
    
    return Object.values(counts).sort((a, b) => FEMALE_ARTISTS.indexOf(a.name) - FEMALE_ARTISTS.indexOf(b.name));
  }, [allSongs, albumCovers]);

  const topArtists = useMemo(() => {
    const counts = {};
    allSongs.forEach(song => {
      const artistNames = splitArtists(song.artist);
      artistNames.forEach(artistName => {
        if (!counts[artistName]) {
          counts[artistName] = { count: 0, name: artistName, cover: albumCovers[song.id] || song.cover };
        }
        counts[artistName].count++;
        // Use latest non-null cover
        if (!counts[artistName].cover && (albumCovers[song.id] || song.cover)) {
          counts[artistName].cover = albumCovers[song.id] || song.cover;
        }
      });
    });
    
    return Object.values(counts)
      .filter(artist => !MALE_ARTISTS.includes(artist.name) && !FEMALE_ARTISTS.includes(artist.name)) // Hide predefined artists from the general popular list to avoid duplication
      .sort((a, b) => b.count - a.count);
  }, [allSongs, albumCovers]);

  const popularActorsData = useMemo(() => {
    const counts = {};
    POPULAR_ACTORS.forEach(actor => {
      const cleanName = actor.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
      counts[actor] = { 
        count: 0, 
        name: actor, 
        cover: ACTOR_IMAGES[actor] || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=random&color=fff&size=500&font-size=0.33`,
        isActor: true
      };
    });

    allSongs.forEach(song => {
      if (song.actor && POPULAR_ACTORS.includes(song.actor)) {
        counts[song.actor].count++;
      }
    });
    
    // Filter out actors with 0 songs if desired, or keep them all. The request asked to create a library for them.
    return Object.values(counts).sort((a, b) => b.count - a.count);
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
        <div className="space-y-12 animate-in fade-in duration-300">
          
          {/* LOCAL RESULTS */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-2xl font-bold tracking-tight">In Your Library</h2>
              <span className="text-white/40 text-sm font-medium">{results.length} found</span>
            </div>
            {results.length === 0 ? (
              <div className="text-center py-10 bg-white/[0.02] border border-white/5 rounded-3xl">
                <p className="text-white/30 font-medium">No matches in local library.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {results.map(song => <SongCard key={song.id} song={song} />)}
              </div>
            )}
          </section>

          {/* GLOBAL SAAVN RESULTS */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 text-2xl font-bold tracking-tight">Global Search</h2>
                {saavnLoading && <Loader2 size={16} className="text-cyan-400 animate-spin" />}
              </div>
              {!saavnLoading && <span className="text-white/40 text-sm font-medium">{saavnResults.length} found</span>}
            </div>
            {saavnLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 5 }).map((_, i) => <SongCardSkeleton key={i} />)}
              </div>
            ) : saavnResults.length === 0 ? (
              <div className="text-center py-10 bg-white/[0.02] border border-cyan-500/10 rounded-3xl">
                <p className="text-white/30 font-medium">No global matches found for "{search}".</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                {saavnResults.map(song => <SongCard key={song.id} song={song} />)}
              </div>
            )}
          </section>
        </div>
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

          <div>
            <SectionHeader icon={Music2} title="Browse Artists" gradient="from-blue-400 to-indigo-500 shadow-blue-500/20" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {topArtists.map(artist => (
                <button
                  key={artist.name}
                  onClick={() => {
                    setActiveArtist(artist.name);
                    setGlobalSection('artist');
                  }}
                  className="group text-left cursor-pointer transition-all duration-300 hover:bg-white/[0.04] p-4 rounded-2xl border border-transparent hover:border-white/5"
                >
                  <div className="relative aspect-square rounded-full overflow-hidden mb-4 shadow-xl">
                    <img src={artist.cover} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  </div>
                  <h3 className="text-white font-bold truncate text-center">{artist.name}</h3>
                  <p className="text-white/40 text-xs text-center mt-1 font-medium">{artist.count} {artist.count === 1 ? 'track' : 'tracks'}</p>
                </button>
              ))}
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
        kuthu: 'from-violet-900/70 via-indigo-900/40 to-transparent',
        melody: 'from-cyan-900/70 via-blue-900/40 to-transparent',
        romance: 'from-fuchsia-900/70 via-rose-900/40 to-transparent',
        sad: 'from-slate-900/70 via-gray-900/40 to-transparent',
        vibes: 'from-amber-900/70 via-orange-900/40 to-transparent',
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
                className="group cursor-pointer flex-shrink-0 w-32 sm:w-44 md:w-48 scroll-snap-x p-2 sm:p-4 rounded-xl hover:bg-white/[0.08] transition-colors duration-300"
                style={{ scrollSnapAlign: 'start' }}
                onClick={() => {
                  if (artist.isActor) {
                    setActiveActor(artist.name);
                    setGlobalSection('actor');
                  } else {
                    setActiveArtist(artist.name);
                    setGlobalSection('artist');
                  }
                }}
              >
                <div className="relative aspect-square rounded-full overflow-hidden mb-3 sm:mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <img src={artist.cover} alt={artist.name} className="w-full h-full object-cover" />
                  <div className="absolute right-2 bottom-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1db954] hover:bg-[#1ed760] hover:scale-105 flex items-center justify-center shadow-xl">
                      <Play size={20} fill="#000" color="#000" className="ml-1 sm:hidden" />
                      <Play size={24} fill="#000" color="#000" className="ml-1 hidden sm:block" />
                    </div>
                  </div>
                </div>
                <h3 className="text-white text-sm sm:text-base font-bold truncate">{artist.name}</h3>
                <p className="text-[#a7a7a7] text-xs sm:text-sm mt-1">{artist.isActor ? 'Actor' : 'Artist'}</p>
              </div>
            ))}
          </div>
        </section>
      );
    };
    const renderBentoSpotlight = (items) => {
      if (!items || items.length < 3) return null;
      const [hero, side1, side2] = items;

      const BentoCard = ({ item, isHero }) => (
        <div 
          onClick={() => setSearch(item.title)}
          className={`relative rounded-[32px] overflow-hidden group cursor-pointer shadow-2xl transition-all duration-700 hover:shadow-cyan-500/20 hover:-translate-y-2 
            ${isHero ? 'md:col-span-2 md:row-span-2 h-[400px] md:h-auto' : 'h-[200px] md:h-auto'}`}
        >
          {/* Blurred Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] group-hover:scale-110"
            style={{ backgroundImage: `url(${item.cover})`, filter: 'brightness(0.6) saturate(1.2)' }}
          />
          {/* Glassmorphism Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          {/* Content */}
          <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10 flex flex-col justify-end ${isHero ? 'h-full' : ''}`}>
            <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20
              ${isHero ? 'translate-y-4 group-hover:translate-y-0' : 'translate-y-2 group-hover:translate-y-0'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-cyan-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 block">
                    {isHero ? '✨ Spotlight' : '🔥 Trending'}
                  </span>
                  <h3 className={`text-white font-extrabold leading-tight tracking-tight truncate ${isHero ? 'text-3xl md:text-5xl' : 'text-xl md:text-2xl'}`}>
                    {item.title}
                  </h3>
                  <p className={`text-white/60 font-medium truncate mt-1 ${isHero ? 'text-base md:text-lg' : 'text-sm'}`}>
                    {item.subtitle}
                  </p>
                </div>
                {/* Glowing Play Button */}
                <div className={`flex-shrink-0 rounded-full bg-cyan-400 text-black flex items-center justify-center transition-all duration-500 shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] group-hover:scale-110
                  ${isHero ? 'w-14 h-14 md:w-16 md:h-16' : 'w-10 h-10 md:w-12 md:h-12'}`}>
                  <Play size={isHero ? 28 : 20} fill="#000" className="ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

      return (
        <section className="animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[220px] md:auto-rows-[250px]">
            <BentoCard item={hero} isHero={true} />
            <BentoCard item={side1} isHero={false} />
            <BentoCard item={side2} isHero={false} />
          </div>
        </section>
      );
    };

    const renderGlassCarousel = (title, items) => {
      if (!items || items.length === 0) return null;
      return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl font-bold tracking-tight">{title}</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto scroll-snap-x scrollbar-none pb-4">
            {items.map(item => (
              <div 
                key={item.id} 
                className="group cursor-pointer flex-shrink-0 w-36 sm:w-48 scroll-snap-x transition-all duration-300"
                style={{ scrollSnapAlign: 'start' }}
                onClick={() => setSearch(item.title)}
              >
                <div className={`relative ${item.type === 'artist' ? 'rounded-full' : 'rounded-[24px]'} aspect-square overflow-hidden mb-4 shadow-lg`}>
                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute right-3 bottom-3 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white hover:border-white group/btn">
                      <Play size={18} fill="#fff" className="ml-1 text-white group-hover/btn:text-black group-hover/btn:fill-black transition-colors" />
                    </div>
                  </div>
                </div>
                <h3 className="text-white text-base font-bold truncate px-1">{item.title}</h3>
                <p className="text-[#a7a7a7] text-sm mt-0.5 truncate px-1">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </section>
      );
    };

    // Default Home view
    return (
      <div className="space-y-4 md:space-y-8 pb-10">
        
        {/* VIBE CHECK (MOOD RINGS) */}
        <section className="animate-in fade-in duration-500 pt-2 pb-6">
          <div className="flex overflow-x-auto gap-3 pb-4 snap-x scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setSelectedMood(null)}
              className={`flex-shrink-0 group flex items-center gap-3 px-5 py-3 rounded-[20px] text-sm font-bold transition-all duration-300 snap-start
                ${!selectedMood ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_20px_rgba(34,211,238,0.4)] text-white scale-105 border border-transparent' : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:-translate-y-1'}`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <Music2 size={14} color="#fff" />
              </div>
              <span className="text-white/90 group-hover:text-white">All Music</span>
            </button>
            {MASTER_MOODS.map(moodKey => {
              const theme = MOOD_THEMES[moodKey];
              const Icon = theme.icon;
              const isSelected = selectedMood === moodKey;
              return (
                <button
                  key={moodKey}
                  onClick={() => setSelectedMood(moodKey)}
                  className={`flex-shrink-0 group flex items-center gap-3 px-5 py-3 rounded-[20px] text-sm font-bold transition-all duration-300 snap-start
                    ${isSelected ? 'bg-white/10 border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105' : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:-translate-y-1'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr ${theme.color} shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]`}>
                    <Icon size={14} color="#fff" />
                  </div>
                  <span className="text-white/90 group-hover:text-white">{theme.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* JIOSAAVN GLOBAL DATA */}
        {saavnHomeLoading ? (
          <div className="flex items-center justify-center py-32"><div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" /></div>
        ) : (
          <>
            {renderBentoSpotlight(saavnHomeData.trending)}
            {renderGlassCarousel('Curated For You', saavnHomeData.playlists)}
          </>
        )}

        {/* LOCAL DATA - VINYL STACK STYLE */}
        {recentlyPlayed.length > 0 && (
          <section className="mt-16 animate-in fade-in slide-in-from-bottom-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Clock size={20} className="text-blue-400" />
              </div>
              <h2 className="text-white text-2xl font-bold tracking-tight">On Heavy Rotation</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyPlayed.slice(0, 6).map((song, i) => (
                <div 
                  key={song.id} 
                  onClick={() => playSong(song)}
                  className="group relative flex items-center gap-4 p-3 pr-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 rounded-[24px] cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {/* Vinyl Record that slides out on hover */}
                    <div className="absolute inset-0 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-500 group-hover:translate-x-6 group-hover:rotate-180">
                      <div className="w-6 h-6 rounded-full border border-[#222] bg-gradient-to-tr from-cyan-600 to-violet-600" />
                    </div>
                    {/* Album Sleeve */}
                    <img 
                      src={albumCovers[song.id] || song.cover} 
                      alt={song.title} 
                      className="absolute inset-0 w-full h-full object-cover rounded-[16px] shadow-lg z-10" 
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500'; }}
                    />
                  </div>
                  <div className="min-w-0 flex-1 z-10">
                    <h3 className="text-white font-bold truncate text-base">{cleanTitle(song.title)}</h3>
                    <p className="text-white/50 text-xs truncate mt-0.5 font-medium">{song.artist}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex flex-shrink-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Play size={14} fill="#fff" className="ml-0.5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}


      </div>
    );
  };
 
  return (
    <div className="p-4 md:p-8 space-y-12">

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
