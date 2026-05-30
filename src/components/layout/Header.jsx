import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, LogOut } from 'lucide-react';
 
export default function Header({ search, setSearch, user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
 
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
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-5 bg-[#07070a]/40 backdrop-blur-xl border-b border-white/5">
      {/* Page title - hidden on mobile since sidebar toggle is there */}
      <h1 className="hidden md:block text-white font-bold text-xl tracking-tight">Good evening 👋</h1>
      <div className="md:hidden" /> {/* spacer for mobile */}
 
      {/* Search */}
      <div className="relative flex-1 max-w-md ml-14 mr-4 md:mx-0 md:ml-auto md:max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={15} />
        <input
          type="text"
          id="search-input"
          placeholder="Search songs, moods..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 focus:border-cyan-500/50 text-white placeholder-white/40 text-sm rounded-2xl pl-10 pr-12 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all duration-300"
        />
        {search ? (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        ) : (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[9px] font-bold text-white/30 pointer-events-none tracking-wide">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        )}
      </div>
 
      {/* User Profile Dropdown */}
      {user && (
        <div className="relative ml-4 flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer"
          >
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover bg-cyan-950 border border-cyan-500/20 flex-shrink-0"
            />
            <span className="hidden sm:block text-white text-sm font-bold truncate max-w-[100px]">{user.name}</span>
            <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
 
          {/* Glass Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-48 bg-[#0d0d12]/95 border border-white/5 backdrop-blur-2xl rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                <p className="text-white text-xs font-bold truncate">{user.name}</p>
                <p className="text-white/40 text-[10px] truncate mt-0.5">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-400 hover:text-rose-350 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
