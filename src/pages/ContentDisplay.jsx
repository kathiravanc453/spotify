import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { ChevronLeft, ChevronRight, Globe2, Sparkles, MonitorSmartphone } from 'lucide-react';

export default function ContentDisplay() {
  const { setActiveSection, goBack } = usePlayer() || {};
  const [reduceAnimation, setReduceAnimation] = useState(false);

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-32 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => goBack('settings')}
          className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex items-center justify-center text-white hover:text-cyan-400 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-white text-3xl font-extrabold tracking-tight">Content and display</h2>
      </div>

      <div className="space-y-6">
        {/* Language Options */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-2 overflow-hidden shadow-xl shadow-black/20">
          <button 
            onClick={() => setActiveSection('language-options')}
            className="w-full flex items-center justify-between p-4 hover:bg-white/[0.04] rounded-2xl transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:text-cyan-400 text-white/70 transition-colors">
                <Globe2 size={20} />
              </div>
              <div className="text-left">
                <span className="text-white font-semibold text-[15px] block">Languages for music</span>
                <span className="text-white/40 text-xs mt-0.5 block">Choose preferred languages for your music</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-white/20 group-hover:text-cyan-400 transition-colors" />
          </button>
        </div>

        {/* Display Preferences */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 shadow-xl shadow-black/20">
          <h3 className="text-white/40 text-sm font-bold uppercase tracking-widest mb-6 ml-1">Display preferences</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between pl-1">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-white/70">
                  <Sparkles size={20} />
                </div>
                <div className="text-left pr-4">
                  <span className="text-white font-semibold text-[15px] block">Reduce animation</span>
                  <span className="text-white/40 text-xs mt-0.5 block">Minimize motion effects throughout the app</span>
                </div>
              </div>
              
              {/* Custom Switch */}
              <button 
                onClick={() => setReduceAnimation(!reduceAnimation)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 ${reduceAnimation ? 'bg-cyan-400' : 'bg-white/20'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${reduceAnimation ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="h-px w-full bg-white/5" />

            <div className="flex items-center justify-between pl-1">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-white/70">
                  <MonitorSmartphone size={20} />
                </div>
                <div className="text-left pr-4">
                  <span className="text-white font-semibold text-[15px] block">App language</span>
                  <span className="text-white/40 text-xs mt-0.5 block">English (System default)</span>
                </div>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors active:scale-95">
                Change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
