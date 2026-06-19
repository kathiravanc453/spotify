import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, LogOut } from 'lucide-react';

function getDynamicGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)  return { text: 'Good morning',   emoji: '🌅' };
  if (hour >= 12 && hour < 17) return { text: 'Good afternoon', emoji: '☀️' };
  if (hour >= 17 && hour < 21) return { text: 'Good evening',   emoji: '👋' };
  return                                { text: 'Good night',     emoji: '🌙' };
}

export default function Header({ search, setSearch, user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [greeting, setGreeting] = useState(getDynamicGreeting);
  const dropdownRef = useRef(null);

  // Update greeting every minute so it stays accurate if app is left open
  useEffect(() => {
    const tick = setInterval(() => setGreeting(getDynamicGreeting()), 60000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-transparent">
      {/* Massive Frost Gradient behind header */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07070a] to-transparent pointer-events-none opacity-80" />
      <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      {/* Left: spacer for mobile hamburger (hamburger is fixed positioned in Sidebar.jsx) */}
      <div className="relative z-10 w-10 md:hidden flex-shrink-0" />

      {/* Page title — desktop only, dynamic time-based greeting */}
      <h1 className="relative z-10 hidden md:block text-white/90 font-extrabold text-2xl tracking-tight flex-shrink-0">
        {greeting.text} {greeting.emoji}
      </h1>

      {/* Expansive Search bar */}
      <div className="relative z-10 flex-1 max-w-[200px] md:max-w-xs mx-3 md:mx-4 md:ml-auto transition-all duration-500 focus-within:max-w-md group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={16} />
          <input
            type="text"
            id="search-input"
            placeholder="Search songs, moods..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 focus:border-cyan-500/50 focus:bg-white/[0.08] text-white placeholder-white/40 text-base md:text-sm font-medium rounded-2xl pl-11 pr-10 py-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-500 backdrop-blur-xl"
          />
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[9px] font-bold text-white/30 pointer-events-none tracking-wide">
            <span>⌘K</span>
          </div>
        )}
        </div>
      </div>

      {/* User Profile Dropdown */}
      {user && (
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer"
          >
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover bg-cyan-950 border border-cyan-500/20 flex-shrink-0"
            />
            <span className="hidden sm:block text-white text-xs font-bold truncate max-w-[80px]">{user.name}</span>
            <ChevronDown size={13} className={`text-white/40 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-[#0d0d12]/98 border border-white/5 backdrop-blur-2xl rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                <p className="text-white text-xs font-bold truncate">{user.name}</p>
                <p className="text-white/40 text-[10px] truncate mt-0.5">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
