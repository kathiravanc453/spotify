import { useState, useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import PlayerFooter from './components/player/PlayerFooter';
import Home from './pages/Home';
import Library from './pages/Library';
import Albums from './pages/Albums';
import Login from './pages/Login';
import Playback from './pages/Playback';

function AppContent({ user, onLogout }) {
  const { activeSection, setActiveSection } = usePlayer();
  const [search, setSearch] = useState('');

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

  const handleSearch = (val) => {
    setSearch(val);
    if (val) setActiveSection('search');
  };

  const renderContent = () => {
    if (activeSection === 'library' || activeSection === 'favorites') {
      return <Library />;
    }
    if (activeSection === 'albums') {
      return <Albums />;
    }
    if (activeSection === 'now-playing') {
      return <Playback />;
    }
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
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area — Header always stays visible */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Header/Banner is ALWAYS rendered regardless of active section */}
          <Header search={search} setSearch={handleSearch} user={user} onLogout={onLogout} />
          <main
            className="flex-1 overflow-y-auto pb-32 md:pb-36"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
          >
            {renderContent()}

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
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const session = localStorage.getItem('rhythmix_session');
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('rhythmix_session');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <PlayerProvider>
      <AppContent user={user} onLogout={handleLogout} />
    </PlayerProvider>
  );
}
