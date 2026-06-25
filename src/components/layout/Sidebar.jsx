import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Home, Search, Library, TrendingUp, Star, X, Music2, Disc, Heart, ChevronRight, ChevronLeft, Menu, Shield, LogOut, User } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

const navItems = [
  { icon: Home,       label: 'Home',        id: 'home'      },
  { icon: Search,     label: 'Search',      id: 'search'    },
  { icon: Heart,      label: 'Favorites',   id: 'favorites' },
  { icon: Disc,       label: 'Albums',      id: 'albums'    },
  { icon: TrendingUp, label: 'Trending',    id: 'trending'  },
  { icon: Star,       label: 'Recommended', id: 'recommended'},
];

function SidebarContent({ activeSection, setActiveSection, onItemClick, user, playlists = [], createPlaylist, onLogout }) {
  return (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Music2 size={20} color="#fff" />
        </div>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-300 font-extrabold text-2xl tracking-tight">
          Rhythmix
        </span>
      </div>

      {/* Account Details */}
      {user ? (
        <div className="px-2 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/5">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover bg-cyan-950 border border-cyan-500/20 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-bold truncate">{user.name}</p>
              <p className="text-white/40 text-[10px] truncate">{user.email}</p>
            </div>
            {onLogout && (
              <button onClick={() => { onLogout(); onItemClick?.(); }} className="text-rose-400 hover:text-rose-300 transition-colors p-1" title="Sign Out">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="px-2 mb-6">
          <button
            onClick={() => { setActiveSection('login'); onItemClick?.(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <User size={16} />
            <span>Sign In</span>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-col gap-1.5">
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => { setActiveSection(id); onItemClick?.(); }}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 w-full text-left
              ${activeSection === id
                ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/5 text-cyan-400 border border-cyan-500/15 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}

        {user?.role === 'admin' && (
          <button
            onClick={() => { setActiveSection('admin'); onItemClick?.(); }}
            className={`flex items-center gap-3.5 px-4 py-3.5 mt-4 rounded-xl text-sm font-bold transition-all duration-300 w-full text-left
              ${activeSection === 'admin'
                ? 'bg-gradient-to-r from-fuchsia-500/20 to-pink-500/10 text-fuchsia-400 border border-fuchsia-500/20 shadow-lg'
                : 'text-fuchsia-400/70 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 border border-fuchsia-500/10'
              }`}
          >
            <Shield size={18} />
            Admin Panel
          </button>
        )}
      </nav>

      {/* Playlists Section */}
      {user && (
        <div className="mt-8 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Your Playlists</h3>
            <button 
              onClick={() => {
                const name = window.prompt('Enter playlist name:');
                if (name && createPlaylist) createPlaylist(name);
              }}
              className="text-white/40 hover:text-white transition-colors"
              title="Create Playlist"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          <div className="space-y-0.5">
            {playlists.map(p => (
              <button
                key={p.id}
                onClick={() => { setActiveSection(`playlist_${p.id}`); onItemClick?.(); }}
                className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeSection === `playlist_${p.id}` ? 'text-cyan-400 bg-white/[0.04]' : 'text-white/60 hover:text-white hover:bg-white/[0.02]'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom branding */}
      <div className="mt-auto px-4 pb-4 space-y-1">
        <p className="text-white/20 text-xs">© 2026 Rhythmix</p>
        <p className="text-white/15 text-[10px] font-semibold tracking-wider uppercase">By Kathir Junior Developer</p>
      </div>
    </div>
  );
}

export default function Sidebar({ user, search, setSearch, onLogout }) {
  const { activeSection, setActiveSection, playlists, createPlaylist } = usePlayer();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar (md+) ─────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-black/20 backdrop-blur-3xl border-r border-white/5 flex-shrink-0 z-20">
        <SidebarContent
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user}
          playlists={playlists}
          createPlaylist={createPlaylist}
          onLogout={onLogout}
        />
      </aside>

      {/* ── Mobile: Header Top Right Icon ───────────── */}
      {['home', 'albums', 'favorites'].includes(activeSection) || (activeSection === 'search' && !search) ? (
        <button
          id="mobile-sidebar-toggle"
          className={`md:hidden fixed top-3.5 right-4 z-[50] w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-200 border border-white/5 ${(mobileOpen || activeSection === 'now-playing') ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'} p-0 overflow-hidden`}
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
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
          className={`md:hidden fixed top-3.5 right-4 z-[999] w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-200 border border-white/5 ${(mobileOpen || activeSection === 'now-playing') ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
          onClick={() => {
            setActiveSection('home');
            if (setSearch) setSearch('');
          }}
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* ── Mobile Sidebar Overlay ────────────────────────────────── */}
      {/* Render mobile sidebar in a portal so it sits above z-10 parent context */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            style={{ zIndex: 100 }}
            onClick={() => setMobileOpen(false)}
          />

          {/* Full-screen Slide-in panel */}
          <div
            className={`md:hidden fixed inset-0 bg-[#07070a]/98 shadow-2xl transition-transform duration-300 ease-out backdrop-blur-3xl overflow-y-auto`}
            style={{ zIndex: 110, transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)' }}
          >
            {/* Top Bar with Back Button */}
            <div className="sticky top-0 z-20 flex items-center px-4 py-4 bg-[#07070a]/80 backdrop-blur-md border-b border-white/5 mb-2">
              <button
                className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex items-center justify-center text-white hover:text-cyan-400 transition-all shadow-lg"
                onClick={() => setMobileOpen(false)}
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <span className="text-white font-extrabold text-lg ml-4 tracking-wide">Menu</span>
            </div>

            <div className="pb-24">
              <SidebarContent
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                onItemClick={() => setMobileOpen(false)}
                user={user}
                onLogout={onLogout}
              />
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
