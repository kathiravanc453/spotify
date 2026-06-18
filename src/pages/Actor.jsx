import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/shared/SongRow';
import { ArrowLeft, Play, Shuffle } from 'lucide-react';

export default function Actor() {
  const { activeActor, setActiveSection, playSong, setIsShuffle } = usePlayer();
  const [actorSongs, setActorSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeActor) {
      setLoading(true);
      // Search JioSaavn specifically for this actor's tamil songs
      fetch(`/api/saavn/search?q=${encodeURIComponent(activeActor + ' tamil songs')}`)
        .then(res => res.json())
        .then(data => {
           if (Array.isArray(data)) setActorSongs(data);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [activeActor]);

  if (!activeActor) {
    setActiveSection('home');
    return null;
  }


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

  const cleanName = activeActor.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
  const actorCover = ACTOR_IMAGES[activeActor] || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=random&color=fff&size=500&font-size=0.33`;

  const handlePlayAll = () => {
    if (actorSongs.length > 0) {
      setIsShuffle(false);
      playSong(actorSongs[0]);
    }
  };

  const handleShuffle = () => {
    if (actorSongs.length > 0) {
      setIsShuffle(true);
      const randomSong = actorSongs[Math.floor(Math.random() * actorSongs.length)];
      playSong(randomSong);
    }
  };

  const getActorColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 35%)`;
  };

  const dominantColor = getActorColor(activeActor);

  return (
    <div className="animate-in fade-in duration-500 pb-32 h-full overflow-y-auto scrollbar-none bg-[#121212]">
      {/* Hero Banner with Dynamic Gradient */}
      <div 
        className="relative h-[40vh] min-h-[340px] w-full mb-8 transition-colors duration-700"
        style={{ backgroundColor: dominantColor }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url(${actorCover})` }}
        />
        {/* Spotify-style gradient fade to bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#121212]" />
        
        {/* Back Button */}
        <button 
          onClick={() => setActiveSection('home')}
          className="absolute top-6 left-6 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Content Container */}
        <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 z-10 text-center md:text-left">
          <div className="w-28 h-28 md:w-48 md:h-48 rounded-full overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex-shrink-0 border-none">
            <img src={actorCover} alt={activeActor} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 pb-0 md:pb-2 flex flex-col items-center md:items-start w-full overflow-hidden">
            <div className="flex items-center gap-2 mb-1 md:mb-2">
              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span className="text-white text-xs md:text-sm font-medium">Verified Actor</span>
            </div>
            <h1 className="text-white text-3xl sm:text-4xl md:text-7xl font-extrabold tracking-tighter mb-2 md:mb-4 w-full truncate drop-shadow-lg">
              {activeActor}
            </h1>
            <p className="text-white/80 font-medium text-xs md:text-base">
              {loading ? 'Fetching global tracks...' : `${actorSongs.length} Tracks`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area with extended gradient */}
      <div 
        className="px-6 md:px-8 relative min-h-screen"
        style={{ backgroundImage: `linear-gradient(to bottom, ${dominantColor}40 0%, transparent 400px)` }}
      >
        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handlePlayAll}
            className="w-14 h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105 active:scale-95"
          >
            <Play size={24} fill="#000" color="#000" className="ml-1" />
          </button>
          <button 
            onClick={handleShuffle}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <Shuffle size={20} />
          </button>
        </div>

        {/* Song List */}
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin mb-4" />
              <p className="text-white/40">Fetching global tracks for {activeActor}...</p>
            </div>
          ) : actorSongs.length > 0 ? (
            actorSongs.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} />
            ))
          ) : (
            <p className="text-white/40 text-center py-10">No songs found for this actor.</p>
          )}
        </div>
      </div>
    </div>
  );
}
