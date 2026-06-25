import React from 'react';

const CATEGORIES = [
  { id: 'podcasts', title: 'Podcasts', color: 'bg-[#27856A]', image: 'https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?w=300' },
  { id: 'live', title: 'Live Events', color: 'bg-[#8400E7]', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300' },
  { id: 'madeforyou', title: 'Made For You', color: 'bg-[#1E3264]', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?w=300' },
  { id: 'new', title: 'New Releases', color: 'bg-[#E8115B]', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300' },
  { id: 'hindi', title: 'Hindi', color: 'bg-[#E13300]', image: 'https://images.unsplash.com/photo-1517230878791-4d28214057c2?w=300' },
  { id: 'punjabi', title: 'Punjabi', color: 'bg-[#148A08]', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
  { id: 'tamil', title: 'Tamil', color: 'bg-[#A56752]', image: 'https://images.unsplash.com/photo-1623057000008-603120155b9e?w=300' },
  { id: 'telugu', title: 'Telugu', color: 'bg-[#D84000]', image: 'https://images.unsplash.com/photo-1528644499236-e170c0c66dbb?w=300' },
  { id: 'pop', title: 'Pop', color: 'bg-[#8D67AB]', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300' },
  { id: 'indie', title: 'Indie', color: 'bg-[#E91429]', image: 'https://images.unsplash.com/photo-1525362081669-2b476bb628c3?w=300' },
  { id: 'romance', title: 'Romance', color: 'bg-[#8C1932]', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300' },
  { id: 'kpop', title: 'K-Pop', color: 'bg-[#148A08]', image: 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=300' },
  { id: 'workout', title: 'Workout', color: 'bg-[#777777]', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300' },
  { id: 'chill', title: 'Chill', color: 'bg-[#D84000]', image: 'https://images.unsplash.com/photo-1499810631641-541e76d678a2?w=300' },
  { id: 'party', title: 'Party', color: 'bg-[#537AA1]', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300' },
  { id: 'sleep', title: 'Sleep', color: 'bg-[#1E3264]', image: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=300' },
  { id: 'focus', title: 'Focus', color: 'bg-[#477D95]', image: 'https://images.unsplash.com/photo-1497331940989-166292211516?w=300' },
  { id: 'jazz', title: 'Jazz', color: 'bg-[#E1118C]', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300' },
];

export default function SearchBrowse({ setSearch }) {
  return (
    <div className="p-4 md:p-8 pb-32 animate-in fade-in duration-500 max-w-7xl mx-auto w-full mt-2">
      <h2 className="text-white text-xl md:text-2xl font-bold mb-6 tracking-tight">Browse all</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {CATEGORIES.map((cat) => (
          <div 
            key={cat.id}
            onClick={() => setSearch(cat.title)}
            className={`${cat.color} rounded-xl aspect-square relative overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform duration-200 shadow-xl group`}
          >
            <h3 className="text-white font-extrabold text-base md:text-xl p-4 tracking-tight z-10 relative drop-shadow-md">
              {cat.title}
            </h3>
            
            <div className="absolute right-0 bottom-0 w-[4.5rem] h-[4.5rem] md:w-28 md:h-28 translate-x-[18%] translate-y-[5%] rotate-[25deg] rounded-lg overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-300">
              <img 
                src={cat.image} 
                alt={cat.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
