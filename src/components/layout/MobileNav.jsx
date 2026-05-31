import { Home, Library, Disc3, Heart, Music } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

const NAV_ITEMS = [
  { id: 'home',      label: 'Home',    icon: Home    },
  { id: 'library',   label: 'Library', icon: Library },
  { id: 'albums',    label: 'Albums',  icon: Disc3   },
  { id: 'favorites', label: 'Liked',   icon: Heart   },
];

export default function MobileNav() {
  const { activeSection, setActiveSection, currentSong } = usePlayer();

  // How tall is the player footer on mobile? ~72px. We sit above it.
  const FOOTER_H = currentSong ? 72 : 0;

  return (
    <nav
      className="md:hidden fixed left-0 right-0 z-40 flex items-center justify-around border-t border-white/[0.06]"
      style={{
        bottom: FOOTER_H,
        background: 'rgba(7,7,10,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`relative flex flex-col items-center gap-0.5 py-2.5 px-5 transition-all duration-300 cursor-pointer
              ${isActive ? 'text-cyan-400' : 'text-white/30 hover:text-white/60'}`}
          >
            <Icon
              size={20}
              className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
              fill={isActive && id === 'favorites' ? 'currentColor' : 'none'}
            />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-50'}`}>
              {label}
            </span>
            {/* Active indicator dot */}
            {isActive && (
              <div className="absolute top-0.5 w-1 h-1 rounded-full bg-cyan-400" />
            )}
          </button>
        );
      })}

      {/* Now Playing shortcut — only when a song is active */}
      {currentSong && (
        <button
          onClick={() => setActiveSection('now-playing')}
          className={`relative flex flex-col items-center gap-0.5 py-2.5 px-5 transition-all duration-300 cursor-pointer
            ${activeSection === 'now-playing' ? 'text-violet-400' : 'text-white/30 hover:text-white/60'}`}
        >
          <Music
            size={20}
            className={`transition-all duration-300 ${activeSection === 'now-playing' ? 'scale-110' : ''}`}
          />
          <span className={`text-[9px] font-bold uppercase tracking-wider ${activeSection === 'now-playing' ? 'opacity-100' : 'opacity-50'}`}>
            Now
          </span>
          {activeSection === 'now-playing' && (
            <div className="absolute top-0.5 w-1 h-1 rounded-full bg-violet-400" />
          )}
        </button>
      )}
    </nav>
  );
}
