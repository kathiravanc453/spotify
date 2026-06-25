import { usePlayer } from '../../context/PlayerContext';
import { Music2, User, ChevronLeft } from 'lucide-react';

export default function Header({ search, setSearch, user }) {
  const { activeSection, setActiveSection } = usePlayer();
  const isHomeView = ['home', 'albums', 'favorites'].includes(activeSection) || (activeSection === 'search' && !search);
  return (
    <header className="relative z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-transparent h-16">
      {/* Massive Frost Gradient behind header */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07070a] to-transparent pointer-events-none opacity-80" />
      <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      
      {/* Logo & Website Name (Left Side) */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Music2 size={16} color="#fff" />
        </div>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-300 font-extrabold text-xl tracking-tight md:hidden">
          Rhythmix
        </span>
      </div>

      {/* Right Icon (Profile or Back) */}
      <div className="relative z-10 flex md:hidden items-center justify-center ml-auto">
        {isHomeView ? (
          <button
            onClick={() => window.dispatchEvent(new Event('toggleMobileMenu'))}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-200 border border-white/5 overflow-hidden p-0"
          >
            {user ? (
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={18} />
            )}
          </button>
        ) : (
          <button
            onClick={() => {
              setActiveSection('home');
              if (setSearch) setSearch('');
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-200 border border-white/5"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
