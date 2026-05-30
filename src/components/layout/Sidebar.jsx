import { useState } from 'react';
import { Home, Search, Library, TrendingUp, Star, Menu, X, Music2, Disc, Heart } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

const navItems = [
  { icon: Home, label: 'Home', id: 'home' },
  { icon: Search, label: 'Search', id: 'search' },
  { icon: Library, label: 'Library', id: 'library' },
  { icon: Heart, label: 'Favorites', id: 'favorites' },
  { icon: Disc, label: 'Albums', id: 'albums' },
  { icon: TrendingUp, label: 'Trending', id: 'trending' },
  { icon: Star, label: 'Recommended', id: 'recommended' },
];

export default function Sidebar() {
  const { activeSection, setActiveSection } = usePlayer();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Music2 size={20} color="#fff" />
        </div>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-300 font-extrabold text-2xl tracking-tight">Rhythmix</span>
      </div>
 
      {/* Nav */}
      <nav className="flex flex-col gap-1.5">
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => { setActiveSection(id); setMobileOpen(false); }}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 w-full text-left
              ${activeSection === id
                ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/5 text-cyan-400 border border-cyan-500/15 shadow-md shadow-cyan-950/20'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
 
      {/* Bottom branding */}
      <div className="mt-auto px-4 pb-10 md:pb-0 space-y-1">
        <p className="text-white/20 text-xs">© 2026 Rhythmix</p>
        <p className="text-white/15 text-[10px] font-semibold tracking-wider uppercase">By Kathir Junior Developer</p>
      </div>
    </div>
  );
 
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-[#07070a]/40 border-r border-white/5 flex-shrink-0 z-20">
        <SidebarContent />
      </aside>
 
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 glassmorphism rounded-2xl flex items-center justify-center text-white border border-white/10"
        onClick={() => setMobileOpen(v => !v)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
 
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-[#0d0d12]/95 backdrop-blur-2xl h-[100dvh] shadow-2xl border-r border-white/5">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
