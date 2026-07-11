import { useMemo, useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/shared/SongCard';
import SongRow from '../components/shared/SongRow';
import { SongCardSkeleton, SongRowSkeleton } from '../components/ui/Skeleton';
import { 
  TrendingUp, Star, Clock, Music, Loader2, Music2, Heart, Zap, Coffee, Sparkles, Search, X, Play,
  Flame, Disc3, Waves, Compass, FolderHeart, CloudRain, Radio, FastForward, Repeat, Hash, Shuffle, MessageSquare, Quote
} from 'lucide-react';
import { cleanTitle, splitArtists } from '../utils/cleanTitle';
import artistImages from '../data/artistImages.json';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useTranslation } from '../utils/i18n';

const ICON_MAP = {
  TrendingUp, Star, Clock, Music, Loader2, Music2, Heart, Zap, Coffee, Sparkles, Search, X, Play,
  Flame, Disc3, Waves, Compass, FolderHeart, CloudRain, Radio, FastForward, Repeat, Hash, Shuffle, MessageSquare, Quote
};

// Curated static folders for the homepage sections
const KADHALE_KADHALE_FOLDERS = [
  {
    id: "kk_vijay_90s",
    title: "Vijay 90s Hits",
    subtitle: "Retro hits of Thalapathy",
    query: "Vijay 90s hits tamil",
    color: "from-amber-500 to-rose-600",
    icon: Star,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500"
  },
  {
    id: "kk_raaja_love",
    title: "Ilaiyaraaja Love",
    subtitle: "Eternal melody king classics",
    query: "Ilaiyaraaja love songs tamil",
    color: "from-teal-500 to-emerald-600",
    icon: Heart,
    cover: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=500"
  },
  {
    id: "kk_2000s_hits",
    title: "2000s Hits",
    subtitle: "Millennium era blockbusters",
    query: "2000s hits tamil",
    color: "from-indigo-500 to-purple-600",
    icon: Music,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500"
  },
  {
    id: "kk_arr_love",
    title: "A.R.R. Love Songs",
    subtitle: "Romance from the Mozart of Madras",
    query: "A R Rahman love songs tamil",
    color: "from-blue-600 to-cyan-500",
    icon: Disc3,
    cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500"
  },
  {
    id: "kk_dance_in_love",
    title: "Dance in Love",
    subtitle: "Romantic dance hits",
    query: "tamil love dance songs",
    color: "from-pink-500 to-rose-500",
    icon: Flame,
    cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500"
  }
];

const COMMUNITY_FOLDERS = [
  {
    id: "comm_romantic_mix",
    title: "Tamil Romantic Mix",
    subtitle: "Perfect mix for romance",
    query: "tamil romantic mix",
    color: "from-fuchsia-500 to-pink-500",
    icon: FolderHeart,
    cover: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500"
  },
  {
    id: "comm_karuna_happy",
    title: "Karuna.Tamil Happy Bass",
    subtitle: "Bass-boosted happy tracks",
    query: "tamil happy bass songs",
    color: "from-violet-600 to-indigo-600",
    icon: Zap,
    cover: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
  },
  {
    id: "comm_og_south",
    title: "OG South",
    subtitle: "Original South Indian classics",
    query: "og south indian hits",
    color: "from-orange-500 to-amber-500",
    icon: Compass,
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500"
  },
  {
    id: "comm_1990s_mix",
    title: "Tamil 1990s Mix Hits",
    subtitle: "Nostalgic 90s mix",
    query: "tamil 1990s mix hits",
    color: "from-yellow-500 to-orange-500",
    icon: Coffee,
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=500"
  },
  {
    id: "comm_beast_mode",
    title: "Beast Mode",
    subtitle: "Gym & high-energy beats",
    query: "tamil gym workout beast mode",
    color: "from-red-600 to-rose-950",
    icon: TrendingUp,
    cover: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500"
  }
];

const MOOD_FOLDERS = [
  {
    id: "mood_dance_mix",
    title: "Tamil Dance Mix",
    subtitle: "Dance hits & fast beats",
    query: "tamil dance mix",
    color: "from-orange-500 to-yellow-500",
    icon: Flame,
    cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500"
  },
  {
    id: "mood_romantic_mix",
    title: "Tamil Romantic Mix",
    subtitle: "Romantic melodies & songs",
    query: "tamil romance hits mix",
    color: "from-rose-500 to-pink-600",
    icon: Heart,
    cover: "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=500"
  },
  {
    id: "mood_2010s_hits",
    title: "Tamil 2010s Hits Mix",
    subtitle: "Chartbusters from 2010-2019",
    query: "tamil 2010s hits mix",
    color: "from-blue-500 to-indigo-500",
    icon: Sparkles,
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500"
  },
  {
    id: "mood_2010s_dance",
    title: "Tamil 2010s Dance Hits",
    subtitle: "Dance chartbusters of the 2010s",
    query: "tamil 2010s dance hits mix",
    color: "from-cyan-500 to-blue-600",
    icon: Zap,
    cover: "https://images.unsplash.com/photo-1486591978090-58e619d37fe7?w=500"
  }
];

const CHARTS_FRESH_FOLDERS = [
  {
    id: "cf_top_chart",
    title: "Top Chart Songs",
    subtitle: "The hottest songs right now",
    query: "tamil top chart songs",
    color: "from-purple-600 to-fuchsia-600",
    icon: TrendingUp,
    cover: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500"
  },
  {
    id: "cf_fresh_hits",
    title: "Fresh Hits",
    subtitle: "Brand new weekly releases",
    query: "tamil fresh hits new songs",
    color: "from-emerald-500 to-teal-600",
    icon: Sparkles,
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500"
  }
];

const YOUR_TOP_MIXES_FOLDERS = [
  {
    id: "ytm_gv_prakash",
    title: "G.V. Prakash Mix",
    subtitle: "Hits of GV Prakash Kumar",
    query: "GV Prakash Tamil Hits",
    color: "from-rose-500 to-red-600",
    icon: Music,
    cover: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500"
  },
  {
    id: "ytm_2020s_mix",
    title: "2020s Mixes",
    subtitle: "Modern chartbusters from 2020",
    query: "2020s Tamil Hits Mix",
    color: "from-blue-600 to-indigo-600",
    icon: Sparkles,
    cover: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500"
  },
  {
    id: "ytm_kollywood_mix",
    title: "Kollywood Mix",
    subtitle: "The best of Tamil cinema soundscapes",
    query: "Kollywood Hits Tamil Mix",
    color: "from-amber-500 to-orange-600",
    icon: Disc3,
    cover: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500"
  },
  {
    id: "ytm_karutha_machan",
    title: "Karutha Machan Mix",
    subtitle: "Karutha Machan Shakthisree Official Mix",
    query: "Karutha Machan Shakthisree Gopalan",
    color: "from-teal-500 to-emerald-600",
    icon: Heart,
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500"
  }
];

const TOP_GENRES_MOODS_FOLDERS = [
  {
    id: "tgm_vidyasagar",
    title: "Vidyasagar Love Songs",
    subtitle: "Sweet melodies of Vidyasagar",
    query: "Vidyasagar Love Hits Tamil",
    color: "from-pink-500 to-rose-500",
    icon: Heart,
    cover: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500"
  },
  {
    id: "tgm_folk_melody",
    title: "Folk Melody",
    subtitle: "Traditional earthy folk melodies",
    query: "Tamil Folk Melodies Songs",
    color: "from-amber-500 to-yellow-600",
    icon: Music,
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500"
  },
  {
    id: "tgm_dance_club",
    title: "Best Dance & Club Beat",
    subtitle: "High-octane club dance hits",
    query: "Tamil Dance Club Beats",
    color: "from-purple-600 to-indigo-600",
    icon: Zap,
    cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500"
  },
  {
    id: "tgm_sad_love",
    title: "Sad Love",
    subtitle: "Heartbreaking romantic melodies",
    query: "Tamil Sad Love Melodies",
    color: "from-slate-600 to-gray-500",
    icon: CloudRain,
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500"
  },
  {
    id: "tgm_chill_hits",
    title: "Chill Hits",
    subtitle: "Relaxing chillout melodies",
    query: "Tamil Chill Hits Lofi",
    color: "from-teal-500 to-emerald-600",
    icon: Coffee,
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500"
  },
  {
    id: "tgm_yuvan_hits",
    title: "Yuvan Shankar Raja Hits",
    subtitle: "BGM king & youth icon hits",
    query: "Yuvan Shankar Raja Tamil Hits",
    color: "from-blue-500 to-indigo-600",
    icon: Disc3,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500"
  }
];

const CURATED_PODCASTS = [
  {
    id: "pod_filmibeat",
    title: "Tamil Filmibeat Podcast",
    subtitle: "Latest Kollywood reviews & gossips",
    cover: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500",
    query: "Tamil Filmibeat Podcast"
  },
  {
    id: "pod_voice",
    title: "Voice of Tamil",
    subtitle: "Heartwarming stories & motivational talks",
    cover: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500",
    query: "Voice of Tamil Podcast"
  },
  {
    id: "pod_lofi",
    title: "Tamil Lofi Storytelling",
    subtitle: "Late-night chill stories & lofi talk",
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=500",
    query: "Tamil Lofi Podcast"
  },
  {
    id: "pod_comedy",
    title: "Tamil Kadhaigal Comedy",
    subtitle: "Fun jokes, humorous stories & gags",
    cover: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=500",
    query: "Tamil Comedy Podcast"
  }
];

const LIVE_RADIO_STATIONS = [
  {
    id: "radio_arr",
    title: "A.R. Rahman Radio",
    subtitle: "Endless hits from the Maestro",
    query: "A R Rahman hits radio",
    cover: "https://images.unsplash.com/photo-1493225457124-a1a2a5f0f06a?w=500"
  },
  {
    id: "radio_anirudh",
    title: "Anirudh Radio",
    subtitle: "High energy Rockstar hits",
    query: "Anirudh Ravichander hits radio",
    cover: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500"
  },
  {
    id: "radio_90s",
    title: "90s Nostalgia Radio",
    subtitle: "Continuous 90s gold",
    query: "90s tamil hits radio",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500"
  },
  {
    id: "radio_melody",
    title: "Melody Radio",
    subtitle: "Sweet, non-stop melodies",
    query: "tamil melody hits radio",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500"
  }
];

const TIME_MACHINE_FOLDERS = [
  {
    id: "tm_80s",
    title: "80s Rewind",
    subtitle: "The golden era of Ilaiyaraaja",
    query: "Ilaiyaraaja 80s hits",
    color: "from-amber-700 to-yellow-900",
    icon: Disc3,
    cover: "https://images.unsplash.com/photo-1508215885820-4585e5610924?w=500"
  },
  {
    id: "tm_90s",
    title: "90s Kids Classics",
    subtitle: "ARR & Vidyasagar beginnings",
    query: "tamil 90s hits classic",
    color: "from-orange-800 to-red-900",
    icon: Coffee,
    cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500"
  },
  {
    id: "tm_00s",
    title: "2000s Y2K",
    subtitle: "The Harris & Yuvan era",
    query: "tamil 2000s super hits",
    color: "from-stone-700 to-neutral-900",
    icon: Compass,
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=500"
  }
];

const COMMUNITY_TICKER_MESSAGES = [
  "Rahul is listening to Leo - Badass",
  "Priya just favorited PS-1 Ponni Nadhi",
  "Karthik is streaming A.R. Rahman Hits",
  "Sneha is currently playing Jailer - Hukum",
  "Vijay added Master - Vaathi Coming to their queue",
  "Anand is vibing to 90s Nostalgia Radio"
];

const LYRICAL_QUOTES = [
  { text: "Kanne kalaimaane, kanni mayilena kanden...", artist: "Ilaiyaraaja", song: "Moondram Pirai" },
  { text: "Munbe vaa en anbe vaa, oone vaa uyire vaa...", artist: "A.R. Rahman", song: "Sillunu Oru Kadhal" },
  { text: "Ennai thalatta varuvala, ennai thaalaatta varuvala...", artist: "Ilaiyaraaja", song: "Kadhalukku Mariyadhai" },
  { text: "Nenjukkul peidhidum maa mazhai, neerukkul moozhgidum...", artist: "Harris Jayaraj", song: "Vaaranam Aayiram" },
  { text: "Idhuvarai illadha uravidhu, idhayathil undana kanavidhu...", artist: "Yuvan Shankar Raja", song: "Goa" }
];

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

const MOOD_PILLS = [
  { label: 'Dance', icon: Flame, query: 'dance hits' },
  { label: 'Romance', icon: Heart, query: 'romantic love' },
  { label: 'Lofi', icon: Coffee, query: 'lofi chill' },
  { label: 'Party', icon: Zap, query: 'party mix' },
  { label: 'Melody', icon: Music, query: 'sweet melodies' },
  { label: 'Sad', icon: CloudRain, query: 'sad broken heart' },
  { label: 'Retro', icon: Disc3, query: 'retro 80s 90s' }
];

export default function Home({ search = '', setSearch, activeSection = 'home' }) {
  const { recentlyPlayed = [], allSongs = [], loading = false, playSong, currentSong, playCounts = {}, albumCovers = {}, setActiveArtist, setActiveActor, setActiveSection: setGlobalSection, saavnResults = [], saavnLoading = false, searchSaavnGlobal, saavnHomeData = { trending: [], playlists: [], albums: [] }, saavnHomeLoading = false, musicLanguages = ['English'] } = usePlayer() || {};
  const { t } = useTranslation();
  
  const [customFolders, setCustomFolders] = useState([]);
  const [homeFilter, setHomeFilter] = useState('music'); // music, podcasts, rhythmix_tunes
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const fetchCustomFolders = async () => {
      if (!db) return;
      try {
        const q = query(collection(db, 'folders'), orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);
        const folders = [];
        querySnapshot.forEach((doc) => {
          folders.push({ id: doc.id, ...doc.data() });
        });
        setCustomFolders(folders);
      } catch (err) {
        console.error("Failed to fetch custom folders from Firestore:", err);
      }
    };
    fetchCustomFolders();
  }, []);

  // No longer merging static folders globally since they are separated by section

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.trim() !== '') {
        searchSaavnGlobal(search);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Hero Banner auto-scroll
  useEffect(() => {
    if (homeFilter !== 'music' || saavnHomeLoading || !saavnHomeData.trending?.length) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % Math.min(5, saavnHomeData.trending.length));
    }, 5000);
    return () => clearInterval(interval);
  }, [homeFilter, saavnHomeLoading, saavnHomeData.trending]);

  const trending = useMemo(() => allSongs.filter(s => s?.trending), [allSongs]);

  // Generate dynamic mixes based on recently played artists
  const dynamicMixes = useMemo(() => {
    if (!recentlyPlayed || recentlyPlayed.length === 0) return [];
    const artists = recentlyPlayed.map(s => s.artist).filter(Boolean);
    const uniqueArtists = [...new Set(artists)].slice(0, 5); // top 5 recent artists
    
    return uniqueArtists.map((artist, idx) => ({
      id: `dyn_mix_${idx}`,
      title: `${artist} Mix`,
      subtitle: `Your personalized mix for ${artist}`,
      query: `${artist} best hits ${musicLanguages[0] || ''}`,
      color: ['from-rose-500 to-red-600', 'from-blue-600 to-indigo-600', 'from-amber-500 to-orange-600', 'from-teal-500 to-emerald-600', 'from-purple-500 to-fuchsia-600'][idx % 5],
      icon: Music2,
      cover: `https://ui-avatars.com/api/?name=${encodeURIComponent(artist)}&background=random&color=fff&size=500`
    }));
  }, [recentlyPlayed, musicLanguages]);

  // Calculate Heavy Rotation based on playCounts
  const heavyRotation = useMemo(() => {
    if (!allSongs || allSongs.length === 0 || Object.keys(playCounts).length === 0) return [];
    const withCounts = allSongs.filter(s => playCounts[s.id] > 0);
    withCounts.sort((a, b) => (playCounts[b.id] || 0) - (playCounts[a.id] || 0));
    return withCounts.slice(0, 6);
  }, [allSongs, playCounts]);

  const randomQuote = useMemo(() => LYRICAL_QUOTES[Math.floor(Math.random() * LYRICAL_QUOTES.length)], []);

  const renderBentoSpotlight = (items) => {
    if (!items || items.length < 3) return null;
    const [hero, side1, side2] = items;
    const BentoCard = ({ item, isHero }) => (
      <div 
        onClick={() => {
          if (item.type === 'song') {
            playSong(item, { initialQueue: items.filter(i => i.type === 'song') });
          } else {
            setSearch(item.title);
          }
        }}
        className={`relative rounded-[32px] overflow-hidden group cursor-pointer shadow-2xl transition-all duration-700 hover:shadow-cyan-500/20 hover:-translate-y-2 
          ${isHero ? 'md:col-span-2 md:row-span-2 h-[400px] md:h-auto' : 'h-[200px] md:h-auto'}`}
      >        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] group-hover:scale-110"
          style={{ backgroundImage: `url(${item.cover})`, filter: 'brightness(0.6) saturate(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-auto md:auto-rows-[250px]">
          <BentoCard item={hero} isHero={true} />
          <BentoCard item={side1} isHero={false} />
          <BentoCard item={side2} isHero={false} />
        </div>
      </section>
    );
  };

  const renderFolderSection = (title, subtitle, SectionIcon, foldersList) => {
    if (!foldersList || foldersList.length === 0) return null;
    return (
      <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <SectionIcon size={20} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-white/40 text-sm font-medium">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto scroll-snap-x scrollbar-none pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {foldersList.map((folder) => {
            const FolderIcon = typeof folder.icon === 'string' ? (ICON_MAP[folder.icon] || FolderHeart) : folder.icon;
            return (
              <div
                key={folder.id}
                onClick={() => {
                  const recentArtists = recentlyPlayed.map(s => s.artist?.split(',')[0]).filter(Boolean);
                  const uniqueArtists = [...new Set(recentArtists)];
                  let dynamicQuery = folder.query;
                  
                  // Make it dynamic by injecting an artist from their listening history
                  if (uniqueArtists.length > 0) {
                    const randomArtist = uniqueArtists[Math.floor(Math.random() * uniqueArtists.length)];
                    dynamicQuery = `${folder.query} ${randomArtist}`;
                  }
                  
                  setSearch(dynamicQuery);
                  setGlobalSection('search');
                }}
                className="group relative overflow-hidden rounded-3xl p-5 bg-white/[0.02] border border-white/5 hover:border-white/20 cursor-pointer transition-all duration-500 hover:-translate-y-1.5 shadow-lg flex flex-col justify-between aspect-square select-none flex-shrink-0 w-36 sm:w-44 md:w-48 scroll-snap-start min-h-[160px]"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Background cover image with overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] group-hover:scale-110"
                  style={{ 
                    backgroundImage: `url(${folder.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500'})`, 
                    filter: 'brightness(0.35) saturate(0.85)' 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-0" />
                
                {/* Icon with colored container */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${folder.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 z-10`}>
                  <FolderIcon size={22} className="text-white" />
                </div>
                
                {/* Text details */}
                <div className="mt-4 z-10">
                  <h3 className="text-white font-extrabold text-sm sm:text-base group-hover:text-cyan-300 transition-colors truncate">{folder.title}</h3>
                  <p className="text-white/40 text-[10px] sm:text-xs font-semibold leading-snug mt-1 line-clamp-2">{folder.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderRadioStations = (title, subtitle, stationsList) => {
    if (!stationsList || stationsList.length === 0) return null;
    return (
      <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <Radio size={20} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-white/40 text-sm font-medium">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto scroll-snap-x scrollbar-none pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {stationsList.map((station) => (
            <div
              key={station.id}
              onClick={() => {
                setSearch(station.query);
                setGlobalSection('search');
              }}
              className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:-translate-y-2 shadow-2xl flex-shrink-0 w-40 sm:w-48 scroll-snap-start h-64 md:h-72"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] group-hover:scale-110"
                style={{ 
                  backgroundImage: `url(${station.cover})`, 
                  filter: 'brightness(0.4) saturate(1.2)' 
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 via-black/40 to-transparent z-0" />
              
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2 py-1 bg-red-500/20 backdrop-blur-md rounded-md border border-red-500/30">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-red-200 uppercase tracking-wider">Live Radio</span>
              </div>
              
              <div className="absolute inset-x-4 bottom-4 z-10">
                <h3 className="text-white font-extrabold text-lg sm:text-xl leading-tight group-hover:text-red-300 transition-colors">{station.title}</h3>
                <p className="text-white/50 text-xs font-semibold leading-snug mt-2 line-clamp-2">{station.subtitle}</p>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 backdrop-blur-sm bg-black/20">
                <div className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform">
                  <Play size={24} fill="#fff" className="ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderTop10Tower = (trendingList) => {
    if (!trendingList || trendingList.length === 0) return null;
    const top10 = trendingList.slice(0, 10);
    return (
      <section className="mb-12 animate-in fade-in duration-500 bg-gradient-to-b from-white/[0.03] to-transparent rounded-[32px] p-6 md:p-8 border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Hash size={24} className="text-black" />
            </div>
            <div>
              <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 text-3xl font-black tracking-tighter uppercase">Global Top 10</h2>
              <p className="text-white/40 text-sm font-semibold tracking-wide">The hottest tracks in the world right now</p>
            </div>
          </div>
          <button className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">
            <Play size={16} fill="#fff" /> Play All
          </button>
        </div>

        <div className="grid grid-rows-2 grid-flow-col gap-3 overflow-x-auto snap-x scrollbar-none pb-4 -mx-6 px-6 md:-mx-0 md:px-0 md:flex md:flex-col md:overflow-visible">
          {top10.map((song, i) => (
            <div 
              key={song.id}
              onClick={() => {
                if (song.type === 'song') playSong(song, { initialQueue: top10 });
              }}
              className="group flex items-center gap-3 md:gap-6 p-3 md:p-4 rounded-2xl bg-white/[0.02] md:bg-transparent hover:bg-white/[0.06] transition-all duration-300 cursor-pointer w-[85vw] sm:w-[350px] md:w-auto snap-start shrink-0"
            >
              <div className="w-6 md:w-12 text-center flex-shrink-0">
                <span className={`text-2xl md:text-4xl font-black italic transition-colors duration-300 ${i === 0 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-700' : 'text-white/10 group-hover:text-white/30'}`}>
                  {i + 1}
                </span>
              </div>
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                <img src={song.image || song.cover} alt={song.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={20} fill="#fff" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-base md:text-lg font-bold truncate group-hover:text-yellow-100 transition-colors">{cleanTitle(song.title)}</h3>
                <p className="text-white/50 text-xs md:text-sm truncate font-medium mt-0.5">{song.subtitle || song.artist}</p>
              </div>
              <div className="hidden sm:block text-white/30 text-sm font-medium mr-4">
                {(Math.random() * 5 + 1).toFixed(1)}M Plays
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderHeavyRotation = (songsList) => {
    if (!songsList || songsList.length === 0) return null;
    return (
      <section className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-white text-2xl font-bold tracking-tight mb-4">Your Heavy Rotation</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {songsList.map((song) => (
            <div 
              key={song.id}
              onClick={() => playSong(song, { initialQueue: songsList })}
              className="group flex items-center bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-md overflow-hidden cursor-pointer transition-all duration-300 shadow-md hover:shadow-cyan-500/10"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 relative">
                <img src={song.image || song.cover} alt={song.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={16} fill="#fff" />
                </div>
              </div>
              <div className="px-3 md:px-4 py-2 min-w-0 flex-1">
                <h3 className="text-white text-xs md:text-sm font-bold truncate">{cleanTitle(song.title)}</h3>
                <p className="text-white/50 text-[10px] md:text-xs truncate font-medium">{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderFreshRadar = (albums, lang) => {
    if (!albums || albums.length === 0) return null;
    const freshAlbums = albums.slice(0, 10);
    return (
      <section className="mb-12 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <Zap size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-500 text-2xl font-black tracking-tighter uppercase">{lang ? `${lang} New Releases` : 'Fresh Radar'}</h2>
            <p className="text-white/40 text-sm font-semibold tracking-wide">Brand new drops</p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto scroll-snap-x scrollbar-none pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {freshAlbums.map(album => (
            <div 
              key={album.id} 
              className="group cursor-pointer flex-shrink-0 w-36 sm:w-44 md:w-48 scroll-snap-x transition-all duration-300"
              style={{ scrollSnapAlign: 'start' }}
              onClick={() => {
                setSearch(album.title);
                setGlobalSection('search');
              }}
            >
              <div className="relative rounded-[24px] aspect-square overflow-hidden mb-3 shadow-lg border border-white/5 hover:border-emerald-500/50 transition-colors duration-300">
                <img src={album.cover} alt={album.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/90 rounded-md shadow-lg shadow-emerald-500/20 animate-pulse">
                  <span className="text-[10px] font-bold text-black uppercase tracking-widest">NEW</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 backdrop-blur-sm bg-black/20">
                  <Play size={32} fill="#10b981" color="#10b981" className="drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
              <h3 className="text-white text-sm md:text-base font-bold truncate px-1 group-hover:text-emerald-300 transition-colors">{album.title}</h3>
              <p className="text-emerald-400/60 text-xs mt-0.5 truncate px-1 font-semibold">Just Dropped</p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderQuoteCard = () => (
    <section className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div 
        onClick={() => {
          setSearch(randomQuote.song);
          setGlobalSection('search');
        }}
        className="relative overflow-hidden rounded-[32px] p-6 md:p-10 cursor-pointer group shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-purple-500/20 border border-white/10"
        style={{ background: 'linear-gradient(135deg, rgba(30,27,75,0.8) 0%, rgba(15,23,42,0.9) 100%)' }}
      >
        <div className="absolute -right-10 -top-10 text-white/5 transform group-hover:rotate-12 transition-transform duration-700 group-hover:scale-110">
          <Quote size={200} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-purple-400 mb-4">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Quote of the Day</span>
          </div>
          <h3 className="text-white text-2xl md:text-4xl font-extrabold italic leading-tight mb-6">
            "{randomQuote.text}"
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 font-bold">{randomQuote.song}</p>
              <p className="text-white/50 text-sm font-medium mt-1">Music by {randomQuote.artist}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-purple-500 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-300">
              <Play size={20} fill="#fff" className="text-white ml-1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );

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
    return MALE_ARTISTS.map(artist => {
      const cleanName = artist.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
      return { 
        count: 10, // Static fake count or ignore it
        name: artist, 
        cover: artistImages[artist] || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=random&color=fff&size=500&font-size=0.33`
      };
    });
  }, []);

  const femaleArtistsData = useMemo(() => {
    return FEMALE_ARTISTS.map(artist => {
      const cleanName = artist.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
      return { 
        count: 10, 
        name: artist, 
        cover: artistImages[artist] || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=random&color=fff&size=500&font-size=0.33`
      };
    });
  }, []);

  const popularActorsData = useMemo(() => {
    return POPULAR_ACTORS.map(actor => {
      const cleanName = actor.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
      return { 
        count: 10, 
        name: actor, 
        cover: ACTOR_IMAGES[actor] || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=random&color=fff&size=500&font-size=0.33`,
        isActor: true
      };
    });
  }, []);
  
  if (loading && allSongs.length === 0) {
    return (
      <div className="p-6 md:p-8 space-y-10">
        {/* Skeleton for featured cards */}
        <div>
          <div className="h-5 w-36 bg-white/[0.06] rounded-full mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
    if (activeSection === 'search' && search.trim()) {
      return (
        <div className="space-y-12 animate-in fade-in duration-300">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 5 }).map((_, i) => <SongCardSkeleton key={i} />)}
              </div>
            ) : saavnResults.length === 0 ? (
              <div className="text-center py-10 bg-white/[0.02] border border-cyan-500/10 rounded-3xl">
                <p className="text-white/30 font-medium">No global matches found for "{search}".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {saavnResults.map(song => <SongCard key={song.id} song={song} songsList={saavnResults} />)}
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
          
          {renderFolderSection("Kadhale Kadhale", "Love & nostalgic classics", Heart, KADHALE_KADHALE_FOLDERS)}
          {renderFolderSection("Your Top Mixes", "Your personalized top compilation mixes", Music2, YOUR_TOP_MIXES_FOLDERS)}
          {renderFolderSection("Community Mixes", "Popular compilation mixes", Coffee, COMMUNITY_FOLDERS)}
          {renderFolderSection("Made For Your Moods", "Personalized soundscapes for every mood", Sparkles, MOOD_FOLDERS)}
          {renderFolderSection("Top Genres & Moods", "The best genres and moods curated for you", Star, TOP_GENRES_MOODS_FOLDERS)}
          {renderFolderSection("Top Charts & Fresh Hits", "The latest releases and trends", TrendingUp, CHARTS_FRESH_FOLDERS)}
          {customFolders.length > 0 && renderFolderSection("Discover More Folders", "Custom folders added by the community & admin", FolderHeart, customFolders)}

          <div>
            <SectionHeader icon={Music2} title="Browse All Moods" gradient="from-cyan-400 to-violet-500 shadow-cyan-500/20" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {MASTER_MOODS.map(moodKey => {
                const theme = MOOD_THEMES[moodKey];
                const Icon = theme.icon;
                return (
                  <button
                    key={moodKey}
                    onClick={() => setSearch(`${theme.label} Tamil Songs`)}
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
              {maleArtistsData.slice(0, 12).map(artist => (
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
                </button>
              ))}
            </div>
          </div>
        </section>
      );
    }
 
    if (activeSection === 'trending') {
      const trendingSongs = saavnHomeData.trending?.filter(item => item.type === 'song') || [];
      return (
        <section className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-white text-3xl font-extrabold tracking-tight mb-2">Trending Charts</h2>
            <p className="text-white/40 text-sm font-medium">The most played tracks right now globally</p>
          </div>
          
          {trendingSongs.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
              <p className="text-white/30 font-medium">Loading trending songs...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <h3 className="text-white text-xl font-bold tracking-tight mb-4 px-2">Top 100 Global Tracks</h3>
              {trendingSongs.map((song, i) => {
                const formattedSong = { ...song, cover: song.image || song.cover, artist: song.subtitle || song.artist };
                const formattedList = trendingSongs.map(s => ({ ...s, cover: s.image || s.cover, artist: s.subtitle || s.artist }));
                return <SongRow key={song.id} song={formattedSong} index={i} songsList={formattedList} />;
              })}
            </div>
          )}
        </section>
      );
    }
 
    if (activeSection === 'recommended') {
      const recommendedPlaylists = saavnHomeData.playlists || [];
      return (
        <section className="space-y-10 animate-in fade-in duration-300">
          <div>
            <h2 className="text-white text-3xl font-extrabold tracking-tight mb-1">Recommended for You</h2>
            <p className="text-white/40 text-sm font-medium">Curated playlists and mixes from JioSaavn</p>
          </div>

          {recommendedPlaylists.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
              <p className="text-white/30 font-medium">Loading recommendations...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
              {recommendedPlaylists.map(playlist => (
                <div 
                  key={playlist.id} 
                  className="group cursor-pointer transition-all duration-300"
                  onClick={() => {
                    setSearch(`${playlist.title} Tamil`);
                    setGlobalSection('search');
                  }}
                >
                  <div className="relative rounded-[24px] aspect-square overflow-hidden mb-4 shadow-lg bg-white/5 border border-white/5">
                    <img src={playlist.image || playlist.cover} alt={playlist.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  </div>
                  <h3 className="text-white text-base font-bold truncate px-1">{playlist.title}</h3>
                  <p className="text-[#a7a7a7] text-sm mt-0.5 truncate px-1">{playlist.subtitle}</p>
                </div>
              ))}
            </div>
          )}
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

        {/* Surprise Me Floating Button (Desktop Only) */}
        <button
          onClick={() => {
            const pool = saavnHomeData.trending?.filter(item => item.type === 'song') || [];
            if (pool.length > 0) {
              const randomSong = pool[Math.floor(Math.random() * pool.length)];
              playSong(randomSong, { initialQueue: pool });
            }
          }}
          className="hidden md:block fixed bottom-24 right-8 z-50 bg-gradient-to-r from-cyan-400 to-violet-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] hover:scale-110 transition-all duration-300 group"
          title="Surprise Me"
        >
          <Sparkles size={24} className="group-hover:animate-pulse" />
        </button>

        {/* TOP FILTER BAR - SIMPLE DESIGN */}
        <div className="flex gap-2.5 pb-4 items-center">
          <button
            onClick={() => setHomeFilter('music')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer
              ${homeFilter === 'music' 
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 scale-105' 
                : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'}`}
          >
            Music
          </button>
          <button
            onClick={() => setHomeFilter('podcasts')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer
              ${homeFilter === 'podcasts' 
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25 scale-105' 
                : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'}`}
          >
            Podcasts
          </button>
          <button
            onClick={() => setHomeFilter('rhythmix_tunes')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer
              ${homeFilter === 'rhythmix_tunes' 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 scale-105' 
                : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'}`}
          >
            Rhythmix Tunes
          </button>
        </div>

        {homeFilter === 'music' && (
          <>
            {/* LIVE COMMUNITY TICKER */}
            <div className="relative w-full overflow-hidden bg-white/[0.03] border-y border-white/5 py-2 mb-6 -mx-4 md:mx-0 px-4 md:px-0 flex items-center rounded-xl md:rounded-full shadow-inner">
              <div className="flex items-center gap-2 text-cyan-400 flex-shrink-0 z-10 bg-[#0a0a0f] md:bg-transparent pr-4 pl-2 md:pl-6">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline-block">Live</span>
              </div>
              <div className="flex flex-1 overflow-hidden">
                <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]">
                  {COMMUNITY_TICKER_MESSAGES.map((msg, i) => (
                    <span key={i} className="text-white/60 text-xs md:text-sm font-medium mx-8 flex items-center gap-2">
                      <MessageSquare size={14} className="text-white/30" /> {msg}
                    </span>
                  ))}
                  {COMMUNITY_TICKER_MESSAGES.map((msg, i) => (
                    <span key={i + 'dup'} className="text-white/60 text-xs md:text-sm font-medium mx-8 flex items-center gap-2">
                      <MessageSquare size={14} className="text-white/30" /> {msg}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* QUICK MOOD PILLS */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-4 mb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {MOOD_PILLS.map((pill, idx) => {
                const Icon = pill.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearch(`${pill.query} ${musicLanguages[0] || ''}`);
                      setGlobalSection('search');
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex-shrink-0 text-white/80 hover:text-white"
                  >
                    <Icon size={14} className="text-cyan-400" />
                    <span className="text-xs font-bold tracking-wide">{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* JIOSAAVN GLOBAL DATA */}
            {saavnHomeLoading ? (
              <div className="flex items-center justify-center py-32"><div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" /></div>
            ) : (
              <>
                {/* HERO BANNER CAROUSEL */}
                {saavnHomeData.trending?.length > 0 && (
                  <section className="mb-10 relative rounded-[32px] overflow-hidden shadow-2xl h-[300px] md:h-[400px] group">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                      style={{ 
                        backgroundImage: `url(${saavnHomeData.trending[heroIndex]?.cover?.replace('150x150', '500x500')})`, 
                        filter: 'blur(20px) brightness(0.4) saturate(1.5)',
                        transform: 'scale(1.1)'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    <div className="absolute inset-0 p-6 md:p-10 flex items-center">
                      <div className="flex gap-6 md:gap-10 items-center w-full animate-in fade-in slide-in-from-right-8 duration-700" key={heroIndex}>
                        <div className="w-32 h-32 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] flex-shrink-0 border border-white/10">
                          <img 
                            src={saavnHomeData.trending[heroIndex]?.cover?.replace('150x150', '500x500')} 
                            alt={saavnHomeData.trending[heroIndex]?.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 border border-cyan-500/20">
                            <Sparkles size={12} /> Featured
                          </span>
                          <h2 className="text-white text-3xl md:text-5xl font-extrabold tracking-tight leading-tight truncate mb-2">
                            {saavnHomeData.trending[heroIndex]?.title}
                          </h2>
                          <p className="text-white/60 text-sm md:text-lg font-medium truncate mb-6">
                            {saavnHomeData.trending[heroIndex]?.subtitle}
                          </p>
                          <button
                            onClick={() => {
                              const item = saavnHomeData.trending[heroIndex];
                              if (item.type === 'song') {
                                playSong(item, { initialQueue: saavnHomeData.trending.filter(i => i.type === 'song') });
                              } else {
                                setSearch(item.title);
                                setGlobalSection('search');
                              }
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black rounded-full font-bold transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                          >
                            <Play size={18} fill="#000" />
                            Play Now
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Carousel Indicators */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                      {saavnHomeData.trending.slice(0, 5).map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`h-1.5 rounded-full transition-all duration-300 ${idx === heroIndex ? 'w-6 bg-cyan-400' : 'w-2 bg-white/20'}`}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* HEAVY ROTATION (LOCAL) */}
                {renderHeavyRotation(heavyRotation)}

                {/* FRESH RADAR (NEW RELEASES) */}
                {renderFreshRadar(saavnHomeData.albums, saavnHomeData.primaryLanguage)}

                {/* LYRICAL QUOTE OF THE DAY */}
                {renderQuoteCard()}

                {/* LOCAL DATA - VINYL STACK STYLE (MOVED TO VERY TOP) */}
                {recentlyPlayed.length > 0 && (
                  <section className="mb-12 animate-in fade-in slide-in-from-bottom-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Clock size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-white text-2xl font-bold tracking-tight">Recently Played</h2>
                        <p className="text-white/40 text-sm font-medium">Jump back in to your favorites</p>
                      </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto scroll-snap-x scrollbar-none pb-4">
                      {recentlyPlayed.slice(0, 20).map((song, i) => (
                        <div 
                          key={song.id} 
                          onClick={() => playSong(song)}
                          className="group relative flex items-center gap-4 p-3 pr-6 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 rounded-[24px] cursor-pointer transition-all duration-300 hover:scale-[1.02] flex-shrink-0 w-[280px] md:w-[320px] scroll-snap-start"
                          style={{ scrollSnapAlign: 'start' }}
                        >
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <div className="absolute inset-0 bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-500 group-hover:translate-x-6 group-hover:rotate-180">
                              <div className="w-6 h-6 rounded-full border border-[#222] bg-gradient-to-tr from-cyan-600 to-violet-600" />
                            </div>
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

                {/* LIVE ARTIST RADIO */}
                {renderRadioStations("Live Artist Radio", "Non-stop curated stations", LIVE_RADIO_STATIONS)}

                {/* DYNAMIC MIXES BASED ON RECENTLY PLAYED */}
                {dynamicMixes.length > 0 && renderFolderSection("Made For You", "Dynamic mixes based on your recent listening", Sparkles, dynamicMixes)}

                {/* TIME MACHINE (RETRO) */}
                {renderFolderSection("Time Machine", "Nostalgic hits from the 80s, 90s and 2000s", Clock, TIME_MACHINE_FOLDERS)}

                {/* TOP 10 TOWER */}
                {renderTop10Tower(saavnHomeData.trending?.filter(item => item.type === 'song'))}

                {renderFolderSection("Kadhale Kadhale", "Love & nostalgic classics", Heart, KADHALE_KADHALE_FOLDERS)}
                {renderFolderSection("Your Top Mixes", "Your personalized top compilation mixes", Music2, YOUR_TOP_MIXES_FOLDERS)}
                {renderFolderSection("Community Mixes", "Popular compilation mixes", Coffee, COMMUNITY_FOLDERS)}
                {renderFolderSection("Made For Your Moods", "Personalized soundscapes for every mood", Sparkles, MOOD_FOLDERS)}
                {renderFolderSection("Top Genres & Moods", "The best genres and moods curated for you", Star, TOP_GENRES_MOODS_FOLDERS)}
                {renderFolderSection("Top Charts & Fresh Hits", "The latest releases and trends", TrendingUp, CHARTS_FRESH_FOLDERS)}
                {customFolders.length > 0 && renderFolderSection("Discover More Folders", "Custom folders added by the community & admin", FolderHeart, customFolders)}


                {renderArtistCarousel('Popular Artists', [...maleArtistsData, ...femaleArtistsData].sort((a, b) => b.count - a.count))}
                {renderGlassCarousel('Popular Albums', saavnHomeData.albums)}
                {renderGlassCarousel('Curated For You', saavnHomeData.playlists)}
              </>
            )}
          </>
        )}

        {homeFilter === 'podcasts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-white text-2xl font-bold tracking-tight">Popular Podcasts</h2>
              <p className="text-white/40 text-sm font-medium">Browse curated trending stories, comedies, and movie talks</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CURATED_PODCASTS.map((podcast) => (
                <div 
                  key={podcast.id}
                  onClick={() => {
                    setSearch(podcast.query);
                    setGlobalSection('search');
                  }}
                  className="group relative overflow-hidden rounded-3xl p-5 bg-white/[0.02] border border-white/5 hover:border-white/20 cursor-pointer transition-all duration-350 hover:-translate-y-1.5 flex flex-col justify-between aspect-video min-h-[160px] select-none"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[5000ms] group-hover:scale-110"
                    style={{ 
                      backgroundImage: `url(${podcast.cover})`, 
                      filter: 'brightness(0.35) saturate(0.85)' 
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-0" />
                  
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 z-10">
                    <Music size={18} className="text-cyan-400" />
                  </div>
                  
                  <div className="z-10 mt-4">
                    <h3 className="text-white font-extrabold text-base group-hover:text-cyan-300 transition-colors truncate">{podcast.title}</h3>
                    <p className="text-white/40 text-xs font-semibold leading-snug mt-1">{podcast.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {homeFilter === 'rhythmix_tunes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-white text-2xl font-bold tracking-tight">Your Rhythmix Tunes</h2>
              <p className="text-white/40 text-sm font-medium">Uploaded local tracks and custom music library</p>
            </div>
            {allSongs.length === 0 ? (
              <div className="text-center py-24 bg-white/[0.01] border border-white/5 rounded-3xl">
                <Music size={48} className="mx-auto mb-4 text-white/10" />
                <p className="text-white/30 font-medium">No uploaded tunes found. Use the Admin Dashboard to add songs!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {allSongs.map((song) => (
                  <SongCard key={song.id} song={song} songsList={allSongs} />
                ))}
              </div>
            )}
          </div>
        )}




      </div>
    );
  };
 
  return (
    <div className="p-4 md:p-8 space-y-12">
      {renderSectionContent()}
    </div>
  );
}
