import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { cleanTitle, moodAccent } from '../../utils/cleanTitle';
import { toast } from '../ui/Toast';
import {
  Play, Heart, Share2, ListPlus, X, Info,
  SkipForward, Ban
} from 'lucide-react';

/**
 * Song Context Bottom Sheet
 * Shows when the user long-presses a song card on mobile.
 * Usage: <SongContextSheet song={song} onClose={() => setCtxSong(null)} />
 */
export default function SongContextSheet({ song, onClose }) {
  const {
    playSong, currentSong, favorites = [],
    toggleLike, playNextSong, addToQueue, allSongs = [],
  } = usePlayer() || {};

  const sheetRef = useRef(null);
  const [visible, setVisible] = useState(false);

  const accent = moodAccent(song?.mood);
  const displayTitle = cleanTitle(song?.title || '');
  const isLiked = favorites.includes(song?.id);

  // Animate in
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  // Close on backdrop click
  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) close();
  };

  // Add song to "Play Next" queue — insert it right after the current song
  const handlePlayNext = () => {
    if (playNextSong) {
      playNextSong(song);
      toast.success(`"${displayTitle}" will play next`);
    }
    close();
  };

  // Add song to bottom of the queue
  const handleAddToQueue = () => {
    if (addToQueue) {
      addToQueue(song);
      toast.success(`Added "${displayTitle}" to queue`);
    }
    close();
  };

  // Share song (Web Share API → fallback to clipboard)
  const handleShare = async () => {
    const text = `🎵 ${displayTitle} — ${song.artist || 'Cloud Artist'} | Rhythmix`;
    try {
      if (navigator.share) {
        await navigator.share({ title: displayTitle, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Song info copied to clipboard!');
      }
    } catch {
      toast.error('Could not share song.');
    }
    close();
  };

  const actions = [
    {
      icon: Play,
      label: 'Play Now',
      color: accent.text,
      action: () => { playSong?.(song); close(); },
    },
    {
      icon: Heart,
      label: isLiked ? 'Remove from Liked' : 'Add to Liked Songs',
      color: isLiked ? 'text-rose-400' : 'text-white/70',
      action: () => {
        toggleLike?.(song.id);
        toast.success(isLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs ❤️');
        close();
      },
    },
    {
      icon: SkipForward,
      label: 'Play Next',
      color: 'text-white/70',
      action: handlePlayNext,
    },
    {
      icon: ListPlus,
      label: 'Add to Queue',
      color: 'text-white/70',
      action: handleAddToQueue,
    },
    {
      icon: Share2,
      label: 'Share Song',
      color: 'text-white/70',
      action: handleShare,
    },
  ];

  if (!song) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onBackdrop}
    >
      <div
        ref={sheetRef}
        className="w-full max-w-lg rounded-t-3xl border-t border-white/10 shadow-2xl transition-transform duration-300"
        style={{
          background: 'rgba(10,10,16,0.97)',
          backdropFilter: 'blur(32px)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Song header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.06]">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
            <img
              src={song.cover}
              alt={displayTitle}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200'; }}
            />
            {/* Mood glow ring */}
            <div className={`absolute inset-0 rounded-2xl ring-1 ${accent.border}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold truncate ${accent.text}`}>{displayTitle}</p>
            <p className="text-white/50 text-xs mt-0.5 truncate">{song.artist || 'Cloud Artist'}</p>
            {song.mood && (
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block ${accent.bg} ${accent.text} border ${accent.border}`}>
                {song.mood}
              </span>
            )}
          </div>
          <button onClick={close} className="text-white/30 hover:text-white p-1.5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Action list */}
        <div className="py-2 px-2">
          {actions.map(({ icon: Icon, label, color, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-all duration-200 text-left"
            >
              <div className={`w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={16} />
              </div>
              <span className="text-white/80 text-sm font-semibold">{label}</span>
            </button>
          ))}
        </div>

        {/* Bottom safe area padding */}
        <div className="h-6" />
      </div>
    </div>
  );
}
