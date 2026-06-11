import fs from 'fs';
import path from 'path';
import https from 'https';

const songsPath = path.join(process.cwd(), 'backend', 'songs.json');

function searchiTunes(term) {
  // Clean up the term (e.g., "04 Germanien Senthan From  Ullasapp" -> "Germanien Senthan Ullasapp")
  let cleanTerm = term.replace(/^\d+\s*/, '').replace(/ From /i, ' ').replace(/ Instr.*/i, '').trim();
  
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanTerm)}&country=in&media=music&entity=song&limit=1`;
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.results && parsed.results.length > 0) {
            resolve(parsed.results[0].artistName);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Fallback dictionary for songs iTunes might miss
const manualOverrides = {
  'Machinichi Varaneram': 'Pushpavanam Kuppusamy',
  'Dandaana Dama': 'Unknown Artist',
  'Kumbida Pona Thaivam': 'Shankar Mahadevan',
  'Kattu Kattu Keera Kattu': 'Manikka Vinayagam',
  'Appan Panna Thappula': 'Pushpavanam Kuppusamy',
  'Palzhapazhakkuthu': 'Harish Raghavendra',
  'Avichuvecha': 'Manikka Vinayagam',
  '04 Germanien Senthan': 'S. Janaki, Jeyachandran',
  '11 Vaasamilla': 'S. P. Balasubrahmanyam',
  '05 Indha Minminikku': 'Malaysia Vasudevan, S. Janaki',
  '01 Yae Paadal Ondru': 'K. J. Yesudas, S. Janaki',
  '08 Ninaivo Oru': 'Kamal Haasan',
  '02 Azhagiya Kanne': 'S. P. Balasubrahmanyam',
  '07 Naane Naana': 'Vani Jairam',
  '10 Paruvame': 'S. P. Balasubrahmanyam, S. Janaki'
};

async function autoAssignArtists() {
  const data = fs.readFileSync(songsPath, 'utf8');
  const songs = JSON.parse(data);
  let updatedCount = 0;
  
  console.log('Starting intelligent artist assignment for pending list...');
  
  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    
    // Check if artist is missing or Unknown
    if (!song.artist || song.artist === 'Unknown Artist' || song.artist === 'Cloud Artist') {
      let newArtist = null;
      
      // 1. Check manual override map
      for (const [key, artist] of Object.entries(manualOverrides)) {
        if (song.title.includes(key)) {
          newArtist = artist;
          break;
        }
      }
      
      // 2. Query iTunes AI matching
      if (!newArtist) {
        newArtist = await searchiTunes(song.title);
        // Wait 200ms to avoid rate limits
        await new Promise(r => setTimeout(r, 200));
      }
      
      if (newArtist && newArtist !== 'Unknown Artist') {
        // Clean up iTunes artist names like "S. P. Balasubrahmanyam"
        songs[i].artist = newArtist;
        updatedCount++;
        console.log(`[Assigned] ${song.title} -> ${newArtist}`);
      } else {
        console.log(`[Pending] ${song.title} -> Could not identify`);
      }
    }
  }
  
  fs.writeFileSync(songsPath, JSON.stringify(songs, null, 2));
  console.log(`\nSuccessfully auto-assigned artists to ${updatedCount} songs!`);
}

autoAssignArtists();
