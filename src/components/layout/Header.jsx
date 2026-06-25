import { usePlayer } from '../../context/PlayerContext';
import { Music2 } from 'lucide-react';

export default function Header() {
  return (
    <header className="relative z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-transparent h-16">
      {/* Massive Frost Gradient behind header */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07070a] to-transparent pointer-events-none opacity-80" />
      <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      
      {/* Logo & Website Name (Left Side) */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Music2 size={16} color="#fff" />
        </div>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-300 font-extrabold text-xl tracking-tight md:hidden">
          Rhythmix
        </span>
      </div>

      {/* Right spacer for mobile hamburger (now on the right) */}
      <div className="relative z-10 w-10 md:hidden flex-shrink-0 ml-auto" />
    </header>
  );
}
