import React from 'react';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const Switch = ({ checked, onChange }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-cyan-500' : 'bg-white/20'}`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export default function SettingsPlayback() {
  const { 
    setActiveSection, 
    gaplessPlayback, setGaplessPlayback,
    autoplayEnabled, setAutoplayEnabled,
    monoAudio, setMonoAudio,
    deviceBroadcast, setDeviceBroadcast,
    pictureInPicture, setPictureInPicture
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
        <h2 className="text-white text-2xl font-bold tracking-tight">Playback</h2>
      </div>

      <div className="space-y-8">
        {/* Track transitions */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-bold">Track transitions</h3>
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <p className="text-white font-medium">Gapless playback</p>
              <p className="text-white/60 text-sm mt-1 leading-snug">Removes any gaps or pauses that may occur in between tracks.</p>
            </div>
            <Switch checked={gaplessPlayback} onChange={setGaplessPlayback} />
          </div>
        </div>

        {/* Listening controls */}
        <div className="space-y-6 pt-4 border-t border-white/10">
          <h3 className="text-white text-lg font-bold">Listening controls</h3>
          
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <p className="text-white font-medium">Autoplay</p>
              <p className="text-white/60 text-sm mt-1 leading-snug">Similar content will play when what you're listening to ends.</p>
            </div>
            <Switch checked={autoplayEnabled} onChange={setAutoplayEnabled} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <p className="text-white font-medium">Mono audio</p>
              <p className="text-white/60 text-sm mt-1 leading-snug">Left and right speakers play the same audio.</p>
            </div>
            <Switch checked={monoAudio} onChange={setMonoAudio} />
          </div>

          <div className="flex items-center justify-between">
            <div className="pr-4">
              <p className="text-white font-medium">Device broadcast status</p>
              <p className="text-white/60 text-sm mt-1 leading-snug">Allows other apps on your device to show what you're listening to.</p>
            </div>
            <Switch checked={deviceBroadcast} onChange={setDeviceBroadcast} />
          </div>

          <button className="flex items-center justify-between w-full text-left group">
            <div className="pr-4">
              <p className="text-white font-medium group-hover:text-cyan-400 transition-colors">Equalizer</p>
              <p className="text-white/60 text-sm mt-1 leading-snug">Adjust different frequencies to enhance your audio experience.</p>
            </div>
            <SlidersHorizontal size={20} className="text-white/40 group-hover:text-cyan-400" />
          </button>
        </div>

        {/* Video controls */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h3 className="text-white text-lg font-bold">Video controls</h3>
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <p className="text-white font-medium">Picture in picture</p>
              <p className="text-white/60 text-sm mt-1 leading-snug">Shrink video in a mini player when you leave Rhythmix, so you can continue watching while using apps.</p>
              <p className="text-white/40 text-xs mt-2 italic">In Android settings, go to Apps &gt; Special app access &gt; Picture-in-picture &gt; Rhythmix to allow picture-in-picture.</p>
            </div>
            <Switch checked={pictureInPicture} onChange={setPictureInPicture} />
          </div>
        </div>

      </div>
    </div>
  );
}
