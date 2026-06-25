import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Crown, Check, ChevronLeft, Zap, Music2 } from 'lucide-react';

export default function PremiumPlans() {
  const { setActiveSection } = usePlayer() || {};

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-32 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={() => setActiveSection('account-settings')}
          className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex items-center justify-center text-white hover:text-cyan-400 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Music2 size={16} color="#fff" />
          </div>
          <span className="text-white font-extrabold tracking-tight text-lg">Rhythmix</span>
        </div>
      </div>

      <div className="text-center space-y-4 mb-10 pt-4">
        <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">
          Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Premium Standard</span>
        </h1>
        <p className="text-white/60 text-lg md:text-xl font-medium">
          Ad-free music listening, offline playback, and more.
        </p>
      </div>

      {/* Featured Plan Card */}
      <div className="bg-gradient-to-br from-[#1a1a24] to-[#0a0a0f] border border-amber-500/30 p-1 rounded-3xl shadow-2xl relative max-w-2xl mx-auto">
        {/* Glow */}
        <div className="absolute inset-0 bg-amber-500/10 rounded-3xl blur-2xl pointer-events-none" />
        
        <div className="bg-[#12121a] rounded-[22px] p-6 md:p-10 relative z-10 overflow-hidden">
          {/* Badge */}
          <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
            Limited Offer
          </div>

          <div className="flex items-center gap-3 mb-6">
            <Crown size={28} className="text-amber-500" />
            <h2 className="text-white text-2xl md:text-3xl font-bold">Premium Standard</h2>
          </div>

          <div className="mb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-white text-4xl md:text-5xl font-extrabold">₹139</span>
              <span className="text-white/40 text-lg font-medium">/ 2 months</span>
            </div>
            <p className="text-white/50 text-sm mt-2 font-medium">Try 2 months for ₹139 with Rhythmix. Then ₹119/month after.</p>
          </div>

          <ul className="space-y-4 mb-10">
            {[
              'Ad-free music listening',
              'Download to listen offline',
              'Play songs in any order',
              'High audio quality',
              'Listen with friends in real time'
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-emerald-400" />
                </div>
                <span className="text-white/80 font-semibold">{feature}</span>
              </li>
            ))}
          </ul>

          <button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-lg py-4 rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
            <Zap size={20} />
            Get 2 Months for ₹139
          </button>
          
          <p className="text-center text-white/30 text-xs mt-4">
            Terms and conditions apply. Open only to users who haven't already tried Premium.
          </p>
        </div>
      </div>

      {/* Available Plans to upgrade next */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h3 className="text-white text-xl font-bold mb-6 text-center">Available plans to upgrade next</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mini Plan Cards */}
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.04] transition-colors flex flex-col h-full">
            <h4 className="text-white font-bold mb-1">Premium Mini</h4>
            <p className="text-white/40 text-xs mb-4 flex-grow">1 day or 1 week of Premium</p>
            <p className="text-white text-xl font-bold mb-4">From ₹7<span className="text-sm font-normal text-white/40">/day</span></p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">View Plan</button>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.04] transition-colors flex flex-col h-full">
            <h4 className="text-white font-bold mb-1">Premium Duo</h4>
            <p className="text-white/40 text-xs mb-4 flex-grow">2 Premium accounts</p>
            <p className="text-white text-xl font-bold mb-4">₹149<span className="text-sm font-normal text-white/40">/month</span></p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">View Plan</button>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:bg-white/[0.04] transition-colors flex flex-col h-full">
            <h4 className="text-white font-bold mb-1">Premium Family</h4>
            <p className="text-white/40 text-xs mb-4 flex-grow">Up to 6 Premium accounts</p>
            <p className="text-white text-xl font-bold mb-4">₹179<span className="text-sm font-normal text-white/40">/month</span></p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">View Plan</button>
          </div>
        </div>
      </div>

    </div>
  );
}
