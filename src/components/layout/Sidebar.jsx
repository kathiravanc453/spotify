import { useState } from 'react';
import { Home, Search, Library, TrendingUp, Star, Menu, X, Music2 } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', id: 'home' },
  { icon: Search, label: 'Search', id: 'search' },
  { icon: Library, label: 'Library', id: 'library' },
  { icon: TrendingUp, label: 'Trending', id: 'trending' },
  { icon: Star, label: 'Recommended', id: 'recommended' },
];

export default function Sidebar({ activeSection, setActiveSection }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-3">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-spotify-green flex items-center justify-center shadow-lg neon-glow">
          <Music2 size={20} color="#000" />
        </div>
        <span className="text-white font-bold text-xl tracking-tight">Rhythmix</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => { setActiveSection(id); setMobileOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left
              ${activeSection === id
                ? 'bg-spotify-green/20 text-spotify-green border border-spotify-green/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom branding */}
      <div className="mt-auto px-4">
        <p className="text-white/20 text-xs">© 2025 Rhythmix</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-spotify-black border-r border-white/5 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 glassmorphism rounded-xl flex items-center justify-center text-white"
        onClick={() => setMobileOpen(v => !v)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-60 bg-spotify-black h-full shadow-2xl">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
