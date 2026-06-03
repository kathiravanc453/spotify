import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export default function UpdateNotification() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 minutes in the background
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-spotify-light/95 backdrop-blur-md border border-spotify-green/30 p-4 rounded-2xl shadow-2xl shadow-spotify-green/20 flex flex-col gap-3">
        <div>
          <h3 className="text-white font-bold">Update Available! 🚀</h3>
          <p className="text-white/70 text-sm">A new version of Rhythmix with new songs is ready.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => updateServiceWorker(true)}
            className="flex-1 bg-spotify-green hover:bg-spotify-green/90 text-black font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <RefreshCw size={18} />
            Update Now
          </button>
          
          <button
            onClick={() => setNeedRefresh(false)}
            className="w-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
