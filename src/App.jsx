import { useState } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import PlayerFooter from './components/player/PlayerFooter';
import Home from './pages/Home';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [search, setSearch] = useState('');

  const handleSearch = (val) => {
    setSearch(val);
    if (val) setActiveSection('home');
  };

  return (
    <PlayerProvider>
      <div className="flex h-screen bg-spotify-black overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header search={search} setSearch={handleSearch} />
          <main
            className="flex-1 overflow-y-auto pb-28"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#404040 transparent' }}
          >
            <Home search={search} />
          </main>
        </div>
      </div>

      {/* Fixed bottom music player */}
      <PlayerFooter />
    </PlayerProvider>
  );
}
