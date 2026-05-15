import { Search, X } from 'lucide-react';

export default function Header({ search, setSearch }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 glassmorphism border-b border-white/5">
      {/* Page title - hidden on mobile since sidebar toggle is there */}
      <h1 className="hidden md:block text-white/80 text-lg font-semibold">Good evening 👋</h1>
      <div className="md:hidden" /> {/* spacer for mobile */}

      {/* Search */}
      <div className="relative flex-1 max-w-md mx-4 md:mx-0 md:ml-auto md:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
        <input
          type="text"
          id="search-input"
          placeholder="Search songs, artists..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm rounded-xl pl-9 pr-9 py-2.5 focus:outline-none focus:border-spotify-green/50 focus:bg-white/8 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </header>
  );
}
