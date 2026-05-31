import { Home, Library, Disc3, Heart, Music } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

const NAV_ITEMS = [
  { id: 'home',      label: 'Home',     icon: Home    },
  { id: 'library',   label: 'Library',  icon: Library },
  { id: 'albums',    label: 'Albums',   icon: Disc3   },
  { id: 'favorites', label: 'Liked',    icon: Heart   },
];

export default function MobileNav() {
  const { activeSection, setActiveSection, currentSong } = usePlayer();

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 border-t border-white/8
        ${currentSong ? 'pb-[72px]' : 'pb-safe pb-2'}
      `}
      style={{
        background: 'rgba(7,7,10,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        paddingBottom: currentSong ? '72px' : 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer
              ${isActive
                ? 'text-cyan-400'
                : 'text-white/30 hover:text-white/60'
              }`}
          >
            <Icon
              size={20}
              className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
              fill={isActive && id === 'favorites' ? 'currentColor' : 'none'}
            />
            <span className={`text-[9px] font-bold uppercase tracking-wider transition-all duration-300
              ${isActive ? 'opacity-100' : 'opacity-50'}`}
            >
              {label}
            </span>
            {isActive && (
              <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-cyan-400" />
            )}
          </button>
        );
      })}

      {/* Now Playing shortcut — only show when a song is playing */}
      {currentSong && (
        <button
          onClick={() => setActiveSection('now-playing')}
          className={`flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer
            ${activeSection === 'now-playing' ? 'text-violet-400' : 'text-white/30 hover:text-white/60'}`}
        >
          <Music
            size={20}
            className={`transition-all duration-300 ${activeSection === 'now-playing' ? 'scale-110 animate-pulse' : ''}`}
          />
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-50">Now</span>
        </button>
      )}
    </nav>
  );
}
