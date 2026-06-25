import { usePlayer } from '../context/PlayerContext';
import { Disc, Play } from 'lucide-react';

const CURATED_TAMIL_ALBUMS = [
  {
    id: "alb_vikram",
    title: "Vikram",
    subtitle: "Anirudh Ravichander",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500",
    query: "Vikram Tamil Album"
  },
  {
    id: "alb_leo",
    title: "Leo",
    subtitle: "Anirudh Ravichander",
    cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500",
    query: "Leo Tamil Album"
  },
  {
    id: "alb_vaaranam_aayiram",
    title: "Vaaranam Aayiram",
    subtitle: "Harris Jayaraj",
    cover: "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=500",
    query: "Vaaranam Aayiram Tamil Album"
  },
  {
    id: "alb_vtv",
    title: "Vinnaithaandi Varuvaayaa",
    subtitle: "A.R. Rahman",
    cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500",
    query: "Vinnaithaandi Varuvaayaa Tamil Album"
  },
  {
    id: "alb_ps1",
    title: "Ponniyin Selvan 1",
    subtitle: "A.R. Rahman",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500",
    query: "Ponniyin Selvan 1 Tamil Album"
  },
  {
    id: "alb_jailer",
    title: "Jailer",
    subtitle: "Anirudh Ravichander",
    cover: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    query: "Jailer Tamil Album"
  },
  {
    id: "alb_paiyaa",
    title: "Paiyaa",
    subtitle: "Yuvan Shankar Raja",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500",
    query: "Paiyaa Tamil Album"
  },
  {
    id: "alb_ghilli",
    title: "Ghilli",
    subtitle: "Vidyasagar",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500",
    query: "Ghilli Tamil Album"
  },
  {
    id: "alb_mankatha",
    title: "Mankatha",
    subtitle: "Yuvan Shankar Raja",
    cover: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=500",
    query: "Mankatha Tamil Album"
  },
  {
    id: "alb_sivaji",
    title: "Sivaji: The Boss",
    subtitle: "A.R. Rahman",
    cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500",
    query: "Sivaji Tamil Album"
  },
  {
    id: "alb_petta",
    title: "Petta",
    subtitle: "Anirudh Ravichander",
    cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500",
    query: "Petta Tamil Album"
  },
  {
    id: "alb_asuran",
    title: "Asuran",
    subtitle: "G.V. Prakash",
    cover: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500",
    query: "Asuran Tamil Album"
  },
  {
    id: "alb_minnale",
    title: "Minnale",
    subtitle: "Harris Jayaraj",
    cover: "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=500",
    query: "Minnale Tamil Album"
  },
  {
    id: "alb_jeans",
    title: "Jeans",
    subtitle: "A.R. Rahman",
    cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=500",
    query: "Jeans Tamil Album"
  },
  {
    id: "alb_enthiran",
    title: "Enthiran",
    subtitle: "A.R. Rahman",
    cover: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500",
    query: "Enthiran Tamil Album"
  },
  {
    id: "alb_theri",
    title: "Theri",
    subtitle: "G.V. Prakash",
    cover: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500",
    query: "Theri Tamil Album"
  }
];

export default function Albums({ setSearch }) {
  const { saavnHomeData = {}, setActiveSection } = usePlayer() || {};
  const globalAlbums = saavnHomeData.albums || [];
  const allAlbums = [...CURATED_TAMIL_ALBUMS, ...globalAlbums];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-[120px]">
      <div>
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-300 font-extrabold text-3xl tracking-tight mb-2">
          Global & Curated Albums
        </h1>
        <p className="text-white/45 text-sm font-medium">Browse dynamic trending hits and local blockbuster Tamil albums</p>
      </div>

      {allAlbums.length === 0 ? (
        <div className="text-center py-24 bg-white/[0.01] border border-white/5 rounded-3xl">
          <Disc size={48} className="mx-auto mb-4 text-white/10" />
          <p className="text-white/30 font-medium">Loading albums...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
          {allAlbums.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (setSearch) {
                  setSearch(item.query || `${item.title} Tamil`);
                  setActiveSection('search');
                }
              }}
              className="group flex flex-col text-left w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 p-4 rounded-3xl transition-all duration-350 cursor-pointer"
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 shadow-lg shadow-black/25 bg-white/5">
                <img
                  src={item.cover || item.image}
                  alt={item.title}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Play size={18} className="ml-1" fill="#000" />
                  </div>
                </div>
              </div>

              <div className="px-1 min-w-0 flex-1 flex flex-col justify-between h-full mt-2">
                <div>
                  <h3 className="text-white font-bold text-sm truncate group-hover:text-cyan-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-white/40 text-xs truncate mt-0.5 font-medium">
                    {item.subtitle || 'Various Artists'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
