import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { User, Mail, MapPin, Crown, ChevronRight, ChevronLeft } from 'lucide-react';

export default function AccountSettings() {
  const { user, setActiveSection, goBack } = usePlayer() || {};

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
        <h2 className="text-white text-3xl font-extrabold tracking-tight">Account overview</h2>
      </div>

      {/* Top Banner Details */}
      <div className="bg-white/[0.03] border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-cyan-950 border-2 border-cyan-500/30 flex-shrink-0 shadow-xl shadow-cyan-500/20">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-4 w-full mt-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3 text-white/50">
              <User size={18} />
              <span className="font-semibold text-sm">Username</span>
            </div>
            <span className="text-white font-bold">{user?.name || 'Guest User'}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3 text-white/50">
              <Mail size={18} />
              <span className="font-semibold text-sm">Email</span>
            </div>
            <span className="text-white font-bold">{user?.email || 'Not provided'}</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3 text-white/50">
              <MapPin size={18} />
              <span className="font-semibold text-sm">Address</span>
            </div>
            <span className="text-white font-bold">India</span>
          </div>
        </div>
      </div>

      {/* Free Plan / Go Premium CTA */}
      <div className="mt-8">
        <h3 className="text-white/40 text-sm font-bold uppercase tracking-widest mb-4 ml-2">Your Plan</h3>
        <button 
          onClick={() => setActiveSection('premium-plans')}
          className="w-full bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 hover:border-cyan-500/50 p-6 rounded-3xl flex items-center justify-between group transition-all"
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-white text-2xl font-extrabold mb-1">Rhythmix Free</span>
            <span className="text-white/50 text-sm font-medium">Tap to explore premium plans</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 md:p-3 rounded-full text-white group-hover:bg-amber-500 group-hover:text-black transition-colors">
              <Crown size={24} />
            </div>
            <ChevronRight size={24} className="text-white/20 group-hover:text-amber-400 transition-colors hidden md:block" />
          </div>
        </button>
      </div>
    </div>
  );
}
