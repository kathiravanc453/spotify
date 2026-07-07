import React from 'react';
import { ArrowLeft, Circle, CheckCircle2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const Switch = ({ checked, onChange }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-cyan-500' : 'bg-white/20'}`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const RadioOption = ({ label, description, checked, onClick }) => (
  <div onClick={onClick} className="flex items-center justify-between cursor-pointer group py-2">
    <div className="pr-4">
      <p className={`font-medium ${checked ? 'text-cyan-400' : 'text-white'}`}>{label}</p>
      {description && <p className="text-white/60 text-sm mt-1 leading-snug">{description}</p>}
    </div>
    {checked ? <CheckCircle2 size={24} className="text-cyan-500 flex-shrink-0" /> : <Circle size={24} className="text-white/40 group-hover:text-white/70 flex-shrink-0" />}
  </div>
);

export default function SettingsDataSaving() {
  const { 
    setActiveSection, 
    dataSaverMode, setDataSaverMode,
    cellularDownloads, setCellularDownloads,
    audioOnlyDownloads, setAudioOnlyDownloads,
    audioOnlyStreaming, setAudioOnlyStreaming
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
        <h2 className="text-white text-2xl font-bold tracking-tight">Data saving and offline</h2>
      </div>

      <div className="space-y-8">
        
        {/* Data Saver Mode */}
        <div className="space-y-4">
          <div>
            <h3 className="text-white text-lg font-bold">Data Saver mode</h3>
            <p className="text-white/60 text-sm mt-1 leading-snug">Choose if you'd like to optimise your data usage. "On" lowers streaming quality and disables other features that use a lot of data, like video previews.</p>
          </div>
          
          <div className="flex flex-col mt-4 space-y-2">
            <RadioOption 
              label="Always on" 
              checked={dataSaverMode === 'Always on'} 
              onClick={() => setDataSaverMode('Always on')} 
            />
            <RadioOption 
              label="Automatic" 
              description="Adjusts based on Android's Data Saver setting."
              checked={dataSaverMode === 'Automatic'} 
              onClick={() => setDataSaverMode('Automatic')} 
            />
            <RadioOption 
              label="Always off" 
              checked={dataSaverMode === 'Always off'} 
              onClick={() => setDataSaverMode('Always off')} 
            />
          </div>
        </div>

        {/* Downloads and streaming */}
        <div className="space-y-6 pt-4 border-t border-white/10">
          <h3 className="text-white text-lg font-bold">Downloads and streaming</h3>
          
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <p className="text-white font-medium">Downloads over cellular</p>
              <p className="text-white/60 text-sm mt-1 leading-snug">Downloads start or continue when you're not connected to Wi-Fi.</p>
            </div>
            <Switch checked={cellularDownloads} onChange={setCellularDownloads} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <p className="text-white font-medium">Audio-only downloads for video podcasts</p>
              <p className="text-white/60 text-sm mt-1 leading-snug">Only the audio will save when you download video podcast.</p>
            </div>
            <Switch checked={audioOnlyDownloads} onChange={setAudioOnlyDownloads} />
          </div>

          <div className="flex items-center justify-between">
            <div className="pr-4">
              <p className="text-white font-medium">Audio-only streaming for video podcasts</p>
              <p className="text-white/60 text-sm mt-1 leading-snug">Video podcasts play as audio-only when you're not connected to Wi-Fi.</p>
              <p className="text-white/40 text-xs mt-2 italic">Video is never streamed when the Rhythmix app is running in the background.</p>
            </div>
            <Switch checked={audioOnlyStreaming} onChange={setAudioOnlyStreaming} />
          </div>
        </div>

      </div>
    </div>
  );
}
