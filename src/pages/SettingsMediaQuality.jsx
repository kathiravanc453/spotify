import React from 'react';
import { ArrowLeft, Crown } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const Switch = ({ checked, onChange }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-cyan-500' : 'bg-white/20'}`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const QualitySelect = ({ value, onChange, label, description }) => {
  const options = [
    { id: 'Automatic', label: 'Automatic' },
    { id: 'Low', label: 'Low' },
    { id: 'Normal', label: 'Normal' },
    { id: 'High', label: 'High' },
    { id: 'Very high', label: 'Very high', premium: true },
    { id: 'Lossless', label: 'Lossless', premium: true },
  ];

  return (
    <div className="flex items-center justify-between py-2">
      <div className="pr-4">
        <p className="text-white font-medium">{label}</p>
        {description && <p className="text-white/60 text-sm mt-1 leading-snug">{description}</p>}
      </div>
      <div className="relative">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white/10 text-white font-medium px-4 py-2 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
        >
          {options.map(opt => (
            <option key={opt.id} value={opt.id} className="bg-[#121212] text-white">
              {opt.label} {opt.premium ? ' (Premium)' : ''}
            </option>
          ))}
        </select>
        {/* Dropdown arrow icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/50">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );
};

export default function SettingsMediaQuality() {
  const { 
    setActiveSection, 
    wifiQuality, setWifiQuality,
    cellularQuality, setCellularQuality,
    autoAdjustQuality, setAutoAdjustQuality,
    downloadQuality, setDownloadQuality
  } = usePlayer() || {};

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
        <h2 className="text-white text-2xl font-bold tracking-tight">Media quality</h2>
      </div>

      <div className="space-y-8">
        
        {/* Audio streaming quality */}
        <div className="space-y-4">
          <div>
            <h3 className="text-white text-lg font-bold">Audio streaming quality</h3>
            <p className="text-white/60 text-sm mt-1 leading-snug">Quality changes on next track (unless a downloaded or higher-quality cached track is available).</p>
          </div>
          
          <div className="space-y-2 mt-4">
            <QualitySelect 
              label="Wi-Fi streaming quality"
              description="Choose the quality of your audio streaming when you're connected to the internet."
              value={wifiQuality}
              onChange={setWifiQuality}
            />
            <QualitySelect 
              label="Cellular streaming quality"
              description="Choose the quality of your audio streaming when you're using mobile data."
              value={cellularQuality}
              onChange={setCellularQuality}
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="pr-4">
              <p className="text-white font-medium">Auto-adjust</p>
              <p className="text-white/60 text-sm mt-1 leading-snug">Your Wi-Fi and cellular streaming quality adjust based on your network bandwidth.</p>
            </div>
            <Switch checked={autoAdjustQuality} onChange={setAutoAdjustQuality} />
          </div>
        </div>

        {/* Download quality */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div>
            <h3 className="text-white text-lg font-bold">Download quality</h3>
            <p className="text-white/60 text-sm mt-1 leading-snug">Higher-quality downloads take up more space.</p>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between py-2">
              <div className="pr-4">
                <p className="text-white font-medium">Audio download quality</p>
                <p className="text-white/60 text-sm mt-1 leading-snug">Choose the quality of all your audio downloads.</p>
              </div>
              <div className="relative">
                <select 
                  value={downloadQuality} 
                  onChange={(e) => setDownloadQuality(e.target.value)}
                  className="appearance-none bg-white/10 text-white font-medium px-4 py-2 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
                >
                  <option value="Automatic" className="bg-[#121212] text-white">Automatic</option>
                  <option value="Low" className="bg-[#121212] text-white">Low</option>
                  <option value="Normal" className="bg-[#121212] text-white">Normal</option>
                  <option value="High" className="bg-[#121212] text-white">High</option>
                  <option value="Lossless" className="bg-[#121212] text-white">Lossless (Premium)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/50">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
