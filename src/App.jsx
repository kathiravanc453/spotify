import { useState, useEffect, useRef } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import PlayerFooter from './components/player/PlayerFooter';
import Home from './pages/Home';
import Library from './pages/Library';
import Albums from './pages/Albums';
import Login from './pages/Login';
import Playback from './pages/Playback';
import ToastProvider from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import useMediaSession from './hooks/useMediaSession';

function AppContent({ user, onLogout }) {
  const { activeSection, setActiveSection, refreshSongs } = usePlayer();
  const [search, setSearch] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const pullStartY = useRef(null);
  const mainRef = useRef(null);

  // 🔒 Lock screen / notification bar media controls
  useMediaSession();

  // Global search shortcut handler (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to top when section changes (using scrollTop for better mobile browser compatibility)
  useEffect(() => {
    if (mainRef.current) {
      try {
        mainRef.current.scrollTop = 0;
      } catch (e) {
        // Ignore fallback errors
      }
    }
  }, [activeSection]);

  const handleSearch = (val) => {
    setSearch(val);
    if (val) setActiveSection('search');
  };

  // ─── Pull-to-refresh (mobile) ─────────────────────────────────────────────
  const onTouchStart = (e) => {
    if (mainRef.current?.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  };
  const onTouchMove = (e) => {
    if (pullStartY.current === null) return;
    const dy = e.touches[0].clientY - pullStartY.current;
    if (dy > 0 && dy < 100) setPullY(dy);
  };
  const onTouchEnd = async () => {
    if (pullY > 60) {
      setIsPulling(true);
      await refreshSongs?.();
      setTimeout(() => setIsPulling(false), 800);
    }
    setPullY(0);
    pullStartY.current = null;
  };

  const renderContent = () => {
    if (activeSection === 'library' || activeSection === 'favorites') return <Library />;
    if (activeSection === 'albums')      return <Albums />;
    if (activeSection === 'now-playing') return <Playback />;
    return <Home search={search} activeSection={activeSection} />;
  };

  return (
    <div className="relative flex h-screen w-screen bg-[#07070a] overflow-hidden">
      {/* Background Ambient Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/0 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-violet-600/10 to-pink-500/0 blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[35%] h-[35%] rounded-full bg-gradient-to-tr from-fuchsia-500/8 to-cyan-500/0 blur-[100px] pointer-events-none" />

      {/* Content wrapper above blobs */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <Sidebar />

        {/* Main content area — Header always stays visible */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header search={search} setSearch={handleSearch} user={user} onLogout={onLogout} />

          {/* Pull-to-refresh indicator */}
          <div
            className="overflow-hidden transition-all duration-300 flex items-center justify-center"
            style={{ height: isPulling ? '40px' : Math.min(pullY * 0.4, 40) + 'px', opacity: isPulling || pullY > 20 ? 1 : 0 }}
          >
            <div className={`flex items-center gap-2 text-cyan-400 text-xs font-bold ${isPulling ? 'animate-pulse' : ''}`}>
              <div className={`w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full ${isPulling ? 'animate-spin' : ''}`} />
              {isPulling ? 'Syncing...' : 'Release to sync'}
            </div>
          </div>

          <main
            ref={mainRef}
            className="flex-1 overflow-y-auto pb-[148px] md:pb-36"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Error boundary wraps page content so crashes don't blank the whole app */}
            <ErrorBoundary>
              {renderContent()}
            </ErrorBoundary>

            {/* Mobile signature branding footer */}
            <div className="md:hidden flex flex-col items-center justify-center pt-8 pb-10 border-t border-white/[0.04] mx-6 opacity-30 mt-8">
              <p className="text-white text-[10px]">© 2026 Rhythmix</p>
              <p className="text-white text-[9px] font-bold tracking-wider uppercase mt-0.5">By Kathir Junior Developer</p>
            </div>
          </main>
        </div>
      </div>

      {/* Fixed bottom music player — always on top */}
      <PlayerFooter />

      {/* Mobile bottom navigation bar */}
      <MobileNav />

      {/* Global toast notifications */}
      <ToastProvider />

      {/* Keyboard shortcuts hint (bottom-left, desktop only) */}
      <div className="hidden lg:flex fixed bottom-24 left-6 z-30 flex-col gap-0.5 opacity-0 hover:opacity-100 transition-opacity duration-500 group pointer-events-none">
        <div className="bg-[#0d0d12]/80 border border-white/5 rounded-xl p-3 backdrop-blur text-[9px] text-white/40 font-mono space-y-1">
          <p className="text-white/60 font-bold text-[9px] mb-1.5 uppercase tracking-wider">Keyboard Shortcuts</p>
          <p><span className="text-white/60">Space</span> — Play / Pause</p>
          <p><span className="text-white/60">← →</span> — Seek 5s</p>
          <p><span className="text-white/60">Shift + ← →</span> — Prev / Next</p>
          <p><span className="text-white/60">↑ ↓</span> — Volume</p>
          <p><span className="text-white/60">M</span> — Mute toggle</p>
          <p><span className="text-white/60">Ctrl+K</span> — Search</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const session = localStorage.getItem('rhythmix_session');
      return session ? JSON.parse(session) : null;
    } catch { return null; }
  });

  const handleLogout = () => {
    localStorage.removeItem('rhythmix_session');
    setUser(null);
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <PlayerProvider>
      <AppContent user={user} onLogout={handleLogout} />
    </PlayerProvider>
  );
}
