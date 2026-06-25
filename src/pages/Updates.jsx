import React from 'react';
import { Bell, Sparkles, CalendarDays, Disc3 } from 'lucide-react';

export default function Updates() {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-32 flex flex-col items-center justify-center min-h-[70vh]">
      
      {/* Icon with Glowing rings */}
      <div className="relative flex items-center justify-center mb-4 mt-8">
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute w-32 h-32 border border-cyan-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute w-24 h-24 border border-violet-500/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
        <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Bell size={28} color="#fff" />
        </div>
      </div>

      {/* Main Text */}
      <div className="text-center space-y-3 max-w-md">
        <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">You're all caught up</h2>
        <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed">
          Watch this space for news on your followers, Playlists, events, and more.
        </p>
      </div>

      {/* Action Card */}
      <div className="mt-8 bg-white/[0.03] border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl max-w-lg w-full text-center hover:bg-white/[0.05] transition-colors duration-300">
        <div className="flex justify-center mb-4">
          <Sparkles className="text-cyan-400" size={32} />
        </div>
        <h3 className="text-white text-xl font-bold mb-2">Looking for new releases?</h3>
        <p className="text-white/50 text-sm md:text-base font-medium mb-6">
          Check out the following feed for music or podcasts.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          <button className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
            <Disc3 size={16} /> Music Feed
          </button>
          <button className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
            <CalendarDays size={16} /> Podcasts Feed
          </button>
        </div>
      </div>

    </div>
  );
}
