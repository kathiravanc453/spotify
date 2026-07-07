import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const AboutItem = ({ label, value, isLink }) => (
  <div className={`flex items-center justify-between py-4 group ${isLink ? 'cursor-pointer hover:bg-white/[0.04] px-4 -mx-4 rounded-xl transition-colors' : ''}`}>
    <span className="text-white font-medium">{label}</span>
    {value ? (
      <span className="text-white/60 text-sm">{value}</span>
    ) : isLink ? (
      <ExternalLink size={18} className="text-white/30 group-hover:text-white/70 transition-colors" />
    ) : null}
  </div>
);

export default function SettingsAbout() {
  const { setActiveSection } = usePlayer() || {};

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in slide-in-from-right-4 duration-300 pb-32 max-w-3xl mx-auto w-full overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 pt-4 pb-6 sticky top-0 bg-[#07070a]/90 backdrop-blur-md z-10 border-b border-white/5">
        <button 
          onClick={() => setActiveSection('settings')} 
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-white text-2xl font-bold tracking-tight">About and support</h2>
      </div>

      <div className="space-y-2">
        <AboutItem label="Version" value="8.9.92.518" />
        <AboutItem label="Player Release" value="v2.1.0-alpha" />
        
        <div className="pt-4 border-t border-white/10 mt-4">
          <AboutItem label="Third-party licences" isLink />
          <AboutItem label="Terms of Use" isLink />
          <AboutItem label="Privacy Policy" isLink />
          <AboutItem label="Platform Rules" isLink />
          <AboutItem label="Support" isLink />
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center mt-12 opacity-40">
        <div className="w-12 h-12 bg-white/10 rounded-xl mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <p className="text-white/60 text-xs text-center">© 2026 Rhythmix.<br/>All rights reserved.</p>
      </div>

    </div>
  );
}
