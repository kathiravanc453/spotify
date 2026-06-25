import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { ChevronLeft, Check } from 'lucide-react';

export default function LanguageOptions() {
  const { setActiveSection, goBack } = usePlayer() || {};
  const [selected, setSelected] = useState(['English', 'Hindi']);

  const languages = [
    'English', 'Hindi', 'Spanish', 'French', 'German', 
    'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Punjabi', 
    'Bengali', 'Marathi', 'Gujarati', 'Japanese', 'Korean'
  ];

  const toggleLanguage = (lang) => {
    setSelected(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-32 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => goBack('content-display')}
          className="w-10 h-10 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 flex items-center justify-center text-white hover:text-cyan-400 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-white text-3xl font-extrabold tracking-tight">Languages for music</h2>
      </div>
      <p className="text-white/50 text-sm ml-14 mb-8">Select the languages you want to hear music in.</p>

      <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden p-3 shadow-xl shadow-black/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {languages.map((lang) => {
            const isSelected = selected.includes(lang);
            return (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                  isSelected ? 'bg-cyan-500/10 border border-cyan-500/20 shadow-md' : 'hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span className={`font-semibold text-[15px] ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                  {lang}
                </span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-cyan-400 text-black' : 'bg-white/10 text-transparent'
                }`}>
                  <Check size={14} strokeWidth={3} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
