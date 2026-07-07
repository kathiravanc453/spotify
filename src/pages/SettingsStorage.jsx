import React, { useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { toast } from '../components/ui/Toast';

export default function SettingsStorage() {
  const { setActiveSection } = usePlayer() || {};
  
  // Simulated storage state for demo purposes
  const [cacheSize, setCacheSize] = useState(48.0);
  const [downloadsSize, setDownloadsSize] = useState(0.0);
  
  const handleRemoveDownloads = () => {
    setDownloadsSize(0);
    toast.success('All downloads removed');
  };
  
  const handleClearCache = () => {
    setCacheSize(0);
    toast.success('Cache cleared successfully');
  };

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
        <h2 className="text-white text-2xl font-bold tracking-tight">Storage</h2>
      </div>

      <div className="space-y-8">
        
        {/* Storage breakdown */}
        <div className="space-y-6">
          <h3 className="text-white text-lg font-bold">Storage breakdown</h3>
          
          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full flex overflow-hidden">
            <div className="h-full bg-zinc-600" style={{ width: '23%' }} /> {/* Other apps */}
            <div className="h-full bg-cyan-400" style={{ width: `${downloadsSize > 0 ? 5 : 0}%` }} /> {/* Downloads */}
            <div className="h-full bg-cyan-600" style={{ width: `${cacheSize > 0 ? 2 : 0}%` }} /> {/* Cache */}
            <div className="h-full bg-white/10 flex-1" /> {/* Free */}
          </div>

          {/* Breakdown Legend */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-zinc-600" />
                <span className="text-white font-medium">Other apps</span>
              </div>
              <span className="text-white/60">50.6 GB</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-white font-medium">Spotify downloads</span>
              </div>
              <span className="text-white/60">{downloadsSize.toFixed(1)} MB</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-600" />
                <span className="text-white font-medium">Spotify cache</span>
              </div>
              <span className="text-white/60">{cacheSize.toFixed(1)} MB</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <span className="text-white font-medium">Free</span>
              </div>
              <span className="text-white/60">169.9 GB</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-6 border-t border-white/10">
          <button 
            onClick={handleRemoveDownloads}
            disabled={downloadsSize === 0}
            className="w-full text-left py-3 group disabled:opacity-50"
          >
            <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">Remove all downloads</p>
            <p className="text-white/60 text-sm mt-1 leading-snug">Remove all the Spotify content you've downloaded to free up space.</p>
          </button>
          
          <button 
            onClick={handleClearCache}
            disabled={cacheSize === 0}
            className="w-full text-left py-3 group disabled:opacity-50"
          >
            <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">Clear cache</p>
            <p className="text-white/60 text-sm mt-1 leading-snug">Free up space by clearing your data. (Your downloads won't be removed.)</p>
          </button>
        </div>

      </div>
    </div>
  );
}
