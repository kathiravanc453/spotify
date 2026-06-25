import React from 'react';
import { User, Contact, ShieldCheck, PlayCircle, Smartphone, Wifi, AudioLines, Megaphone, HelpCircle, ChevronRight, Crown } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function Settings() {
  const { setActiveSection } = usePlayer() || {};

  const settingsItems = [
    { label: 'Account', icon: User, id: 'account-settings' },
    { label: 'Contact and display', icon: Contact },
    { label: 'Privacy and social', icon: ShieldCheck },
    { label: 'Playback', icon: PlayCircle },
    { label: 'App and devices', icon: Smartphone },
    { label: 'Data saving and offline', icon: Wifi },
    { label: 'Media quality', icon: AudioLines },
    { label: 'Advertisement', icon: Megaphone },
    { label: 'About and support', icon: HelpCircle },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-32 max-w-3xl mx-auto w-full">
      {/* Top Header - Premium CTA */}
      <div className="flex flex-col items-center justify-center pt-6 pb-10 border-b border-white/5">
        <h2 className="text-white text-3xl font-extrabold tracking-tight mb-2">Settings and privacy</h2>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-white/60 font-medium">Free account</span>
        </div>
        <button 
          onClick={() => setActiveSection('premium-plans')}
          className="bg-white text-black hover:scale-105 active:scale-95 transition-all font-bold px-8 py-3 rounded-full flex items-center gap-2 shadow-xl shadow-white/10"
        >
          <Crown size={20} className="text-amber-500" />
          Go Premium
        </button>
      </div>

      {/* Settings List */}
      <div className="flex flex-col gap-2">
        {settingsItems.map((item, i) => (
          <button 
            key={i}
            onClick={() => item.id && setActiveSection(item.id)}
            className="flex items-center justify-between w-full px-4 py-4 rounded-2xl hover:bg-white/[0.04] transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:text-cyan-400 text-white/70 transition-colors">
                <item.icon size={20} />
              </div>
              <span className="text-white font-semibold text-[15px]">{item.label}</span>
            </div>
            <ChevronRight size={20} className="text-white/20 group-hover:text-white/50 transition-colors" />
          </button>
        ))}
      </div>
      
    </div>
  );
}
