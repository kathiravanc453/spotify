import { useState, useEffect, useRef } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Sidebar from './components/layout/Sidebar';
import TrendingSidebar from './components/layout/TrendingSidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import PlayerFooter from './components/player/PlayerFooter';
import { Suspense, lazy } from 'react';

// Lazy load heavy pages for route-level code splitting
const Home = lazy(() => import('./pages/Home'));
const Library = lazy(() => import('./pages/Library'));
const Albums = lazy(() => import('./pages/Albums'));
const Login = lazy(() => import('./pages/Login'));
const Playback = lazy(() => import('./pages/Playback'));
const AdminUpload = lazy(() => import('./pages/AdminUpload'));
const Artist = lazy(() => import('./pages/Artist'));
const Actor = lazy(() => import('./pages/Actor'));
import ToastProvider from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import useMediaSession from './hooks/useMediaSession';
import UpdateNotification from './components/UpdateNotification';
import { moodAccent } from './utils/cleanTitle';

function AppContent({ user, onLogout, onLogin }) {
  const { activeSection, setActiveSection, refreshSongs, currentSong, albumCovers = {} } = usePlayer();
  const [search, setSearch] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [installPrompt, setInstallPrompt] = useState(null);
  const pullStartY = useRef(null);
  const mainRef = useRef(null);

  // 🔒 PWA Install Prompt & Telemetry Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent standard browser popup
      setInstallPrompt(e); // Save event to trigger manually later
    };

    const handleAppInstalled = async () => {
      // PWA has been successfully installed, log it to the backend!
      try {
        await fetch('/api/stats/download', { method: 'POST' });
      } catch (err) {
        console.error('Failed to log PWA download:', err);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

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

  // Listen for custom event to clear search from Sidebar back button
  useEffect(() => {
    const handleClearSearch = () => setSearch('');
    window.addEventListener('clear-search', handleClearSearch);
    return () => window.removeEventListener('clear-search', handleClearSearch);
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
    if (activeSection === 'now-playing') return; // Disable pull-to-refresh on playback screen to prevent conflict with swipe-to-close
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

  const PageLoader = () => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 animate-in fade-in duration-300">
      <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
    </div>
  );

  const renderContent = () => {
    if (activeSection === 'login' && !user) {
      return (
        <div className="fixed inset-0 z-[100] bg-[#07070a]">
          <Login onLogin={(u) => { onLogin(u); setActiveSection('home'); }} />
        </div>
      );
    }
    
    if (activeSection === 'admin')       return <AdminUpload />;
    if (activeSection === 'library' || activeSection === 'favorites' || activeSection?.startsWith('playlist_')) return <Library />;
    if (activeSection === 'albums')      return <Albums setSearch={handleSearch} />;
    if (activeSection === 'now-playing') return <Playback />;
    if (activeSection === 'artist')      return <Artist />;
    if (activeSection === 'actor')       return <Actor setSearch={handleSearch} />;
    return <Home search={search} setSearch={handleSearch} activeSection={activeSection} />;
  };

  const accent = moodAccent(currentSong?.mood);

  return (
    <div className="relative flex h-screen w-screen bg-[#07070a] overflow-hidden">
      {/* Global Algorithmic Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-1000 opacity-60">
        {currentSong ? (
          <>
            {/* Cinematic Album Blur (Optimized for Mobile) */}
            <div
              className="absolute inset-[-50%] bg-cover bg-center transition-all duration-[3000ms] opacity-30 transform-gpu will-change-transform"
              style={{ backgroundImage: `url(${albumCovers[currentSong.id] || currentSong.cover})`, filter: 'blur(60px) saturate(1.5)' }}
            />
            {/* Dynamic Mood Aura */}
            <div 
              className="absolute inset-0 opacity-15 transition-colors duration-[2000ms] transform-gpu"
              style={{ background: `radial-gradient(circle at 30% 20%, ${accent.hex}, transparent 60%), radial-gradient(circle at 70% 80%, ${accent.hex}, transparent 60%)` }}
            />
          </>
        ) : (
          /* Default Ambient State */
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/0 blur-3xl pointer-events-none transform-gpu" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-violet-600/10 to-pink-500/0 blur-3xl pointer-events-none transform-gpu" />
            <div className="absolute top-[30%] right-[20%] w-[35%] h-[35%] rounded-full bg-gradient-to-tr from-fuchsia-500/8 to-cyan-500/0 blur-[60px] pointer-events-none transform-gpu" />
          </>
        )}
      </div>

      {/* Content wrapper above blobs */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <Sidebar user={user} search={search} setSearch={handleSearch} onLogout={onLogout} />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {activeSection !== 'now-playing' && (
            <Header search={search} setSearch={handleSearch} user={user} onLogout={onLogout} />
          )}

          {/* Pull-to-refresh indicator */}
          {activeSection !== 'now-playing' && (
            <div
              className="overflow-hidden transition-all duration-300 flex items-center justify-center"
              style={{ height: isPulling ? '40px' : Math.min(pullY * 0.4, 40) + 'px', opacity: isPulling || pullY > 20 ? 1 : 0 }}
            >
              <div className={`flex items-center gap-2 text-cyan-400 text-xs font-bold ${isPulling ? 'animate-pulse' : ''}`}>
                <div className={`w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full ${isPulling ? 'animate-spin' : ''}`} />
                {isPulling ? 'Syncing...' : 'Release to sync'}
              </div>
            </div>
          )}

          <main 
            ref={mainRef}
            className={`flex-grow overflow-y-auto flex flex-col ${activeSection === 'now-playing' ? 'pb-0' : 'pb-[148px] md:pb-36'}`}
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex-1 flex flex-col w-full">
              {/* Native PWA Install Banner */}
              {installPrompt && activeSection !== 'now-playing' && (
                <div className="mx-4 md:mx-8 mt-4 mb-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-900/40 to-violet-900/40 border border-cyan-500/20 shadow-lg shadow-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <h3 className="text-white font-bold text-sm">Install Rhythmix</h3>
                    <p className="text-white/60 text-xs mt-1">Get the native app experience on your home screen.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setInstallPrompt(null)}
                      className="text-white/40 hover:text-white text-xs font-semibold px-2 py-2"
                    >
                      Not Now
                    </button>
                    <button 
                      onClick={handleInstallClick}
                      className="bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold px-4 py-2 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Install App
                    </button>
                  </div>
                </div>
              )}

              {/* Error boundary wraps page content so crashes don't blank the whole app */}
              <Suspense fallback={<PageLoader />}>
                <ErrorBoundary>
                  {renderContent()}
                </ErrorBoundary>
              </Suspense>
            </div>

            {/* Mobile signature branding footer */}
            {activeSection !== 'now-playing' && (
              <div className="md:hidden flex flex-col items-center justify-center pt-8 pb-10 border-t border-white/[0.04] mx-6 opacity-30 mt-auto">
                <p className="text-white text-[10px]">© 2026 Rhythmix</p>
                <p className="text-white text-[9px] font-bold tracking-wider uppercase mt-0.5">By Kathir Junior Developer</p>
              </div>
            )}
          </main>
        </div>

        {/* Global Trending Sidebar — desktop right side only */}
        <TrendingSidebar />

        {/* Fixed bottom music player — always on top */}
        <PlayerFooter />

        {/* Mobile bottom navigation bar */}
        <MobileNav />

        {/* Global toast notifications */}
        <ToastProvider />
      </div>

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

  const handleLogout = async () => {
    localStorage.removeItem('rhythmix_session');
    localStorage.removeItem('rhythmix_admin_session');
    setUser(null);
    try {
      const { auth } = await import('./firebase');
      if (auth) await auth.signOut();
    } catch (e) {
      console.error('Firebase sign out error', e);
    }
  };

  // Remove the strict !user check here so users can browse without logging in
  // if (!user) return <Login onLogin={setUser} />;

  return (
    <ErrorBoundary>
      <div className="bg-[#07070a] min-h-screen">
        <UpdateNotification />
        <PlayerProvider user={user}>
          <AppContent user={user} onLogout={handleLogout} onLogin={setUser} />
        </PlayerProvider>
      </div>
    </ErrorBoundary>
  );
}
