import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

// Toast store — singleton so any component can fire a toast
let _addToast = null;
export const toast = {
  success: (msg) => _addToast?.({ type: 'success', msg }),
  error:   (msg) => _addToast?.({ type: 'error',   msg }),
  info:    (msg) => _addToast?.({ type: 'info',    msg }),
};

let _id = 0;

export default function ToastProvider() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type, msg }) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, type, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const icons = {
    success: <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />,
    error:   <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />,
    info:    <Info        size={16} className="text-cyan-400 flex-shrink-0" />,
  };

  const bars = {
    success: 'bg-emerald-400',
    error:   'bg-rose-400',
    info:    'bg-cyan-400',
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto relative overflow-hidden flex items-start gap-3 px-4 py-3.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right-5 duration-300"
          style={{ background: 'rgba(12,12,18,0.92)' }}
        >
          {/* Coloured left bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${bars[t.type]} rounded-l-2xl`} />
          {icons[t.type]}
          <p className="text-white text-xs font-semibold flex-1 leading-relaxed">{t.msg}</p>
          <button
            onClick={() => remove(t.id)}
            className="text-white/30 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={13} />
          </button>
          {/* Auto-shrink progress bar */}
          <div
            className={`absolute bottom-0 left-0 h-[2px] ${bars[t.type]} opacity-40`}
            style={{ animation: 'toast-shrink 4s linear forwards' }}
          />
        </div>
      ))}
      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
