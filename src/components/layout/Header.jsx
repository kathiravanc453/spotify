import { usePlayer } from '../../context/PlayerContext';
import { Music2, User, ChevronLeft, Search, X } from 'lucide-react';

export default function Header({ search, setSearch, user }) {
  const { activeSection, goBack } = usePlayer();
  const isHomeView = ['home', 'albums', 'favorites'].includes(activeSection) || (activeSection === 'search' && !search);
  
  return (
    <header className="relative z-30 flex items-center justify-between px-4 md:px-8 py-3 bg-transparent h-16 gap-3 md:gap-6">
      {/* Massive Frost Gradient behind header */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07070a] to-transparent pointer-events-none opacity-80" />
      <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      
      {/* Logo & Website Name (Left Side) */}
      <div className="relative z-10 flex items-center gap-3 min-w-[40px]">
        <div 
          onClick={() => goBack('home')}
          className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0 cursor-pointer"
        >
          <Music2 size={16} color="#fff" />
        </div>
        {activeSection !== 'search' && (
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-300 font-extrabold text-xl tracking-tight md:hidden">
            Rhythmix
          </span>
        )}
      </div>

      {/* Top Center Search Bar */}
      <div className="relative z-10 flex-1 max-w-2xl mx-auto flex justify-center w-full">
        {activeSection === 'search' && (
          <div className="w-full relative group animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/50 group-focus-within:text-white transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={search}
              onChange={(e) => setSearch?.(e.target.value)}
              className="w-full bg-[#12121a]/80 hover:bg-[#1a1a24] focus:bg-[#1a1a24] border border-white/10 focus:border-cyan-500/50 rounded-full py-2 pl-10 pr-10 text-white text-sm outline-none transition-all duration-300 shadow-xl placeholder:text-white/40"
              autoFocus
            />
            {search && (
              <button 
                onClick={() => setSearch?.('')}
                className="absolute inset-y-0 right-3 flex items-center text-white/50 hover:text-white transition-colors cursor-pointer z-10"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right Icon (Profile or Back) */}
      <div className="relative z-10 flex items-center justify-end min-w-[40px] md:hidden">
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
            onClick={() => goBack('home')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-200 border border-white/5 flex-shrink-0 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
