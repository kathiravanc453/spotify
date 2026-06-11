import fs from 'fs';
import path from 'path';

const songsPath = path.join(process.cwd(), 'backend', 'songs.json');

const romanceKeywords = ['kadhal', 'kadal', 'anbe', 'kanne', 'uyire', 'nenje', 'mutham', 'kannil', 'unnale', 'azhagiya', 'poove', 'aasai', 'kannavae', 'romance'];
const energyKeywords = ['kuthu', 'mass', 'beat', 'dance', 'bgm', 'intro', 'verithanam', 'theri', 'sodakku', 'thiparakattum', 'nooru', 'aadiva', 'pootiyae', 'energy'];
const melodyKeywords = ['melody', 'ragam', 'swaram', 'paattu', 'isai', 'raaga', 'vaasamilla', 'ninaivo', 'sollamal', 'sollava', 'vanavillin'];
const vibesKeywords = ['chill', 'lofi', 'vibe', 'night', 'travel', 'instrumental', 'inst', 'instr', 'theme'];

function assignMood(title, artist) {
  const text = `${title} ${artist}`.toLowerCase();
  
  for (const word of energyKeywords) {
    if (text.includes(word)) return 'energy boost';
  }
  
  for (const word of romanceKeywords) {
    if (text.includes(word)) return 'romance';
  }
  
  for (const word of melodyKeywords) {
    if (text.includes(word)) return 'melody';
  }
  
  for (const word of vibesKeywords) {
    if (text.includes(word)) return 'vibes';
  }
  
  // Default fallback if no keywords matched
  // We can use a deterministic hash of the title so it's consistent
  const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const moods = ['love', 'melody', 'vibes', 'energy boost'];
  return moods[hash % moods.length];
}

function updateMoods() {
  const data = fs.readFileSync(songsPath, 'utf8');
  const songs = JSON.parse(data);
  let updated = 0;
  
  const updatedSongs = songs.map(song => {
    // Re-assign the mood intelligently!
    const newMood = assignMood(song.title, song.artist);
    if (song.mood !== newMood) {
      updated++;
      return { ...song, mood: newMood };
    }
    return song;
  });
  
  fs.writeFileSync(songsPath, JSON.stringify(updatedSongs, null, 2));
  console.log(`Successfully analyzed and assigned new smart moods to ${updated} songs!`);
}

updateMoods();
