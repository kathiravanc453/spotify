import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, '..', 'src', 'data', 'songs.json');

const getAICover = (title, artist) => {
  const prompt = `artistic album cover for the song "${title}" by "${artist}", high resolution music art`;
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
};

try {
    let songs = JSON.parse(fs.readFileSync(file, 'utf-8'));
    let count = 0;
    songs = songs.map(s => {
        if (!s.cover || s.cover.includes('favicon.svg') || s.cover === '' || s.cover === '/images/default.png') {
            s.cover = getAICover(s.title, s.artist);
            count++;
        }
        return s;
    });
    fs.writeFileSync(file, JSON.stringify(songs, null, 2));
    console.log(`\n✅ SUCCESSFULLY FIXED ${count} ALBUM COVERS!`);
    console.log(`🚀 Refresh your browser to see the results.\n`);
} catch (e) {
    console.error('Error:', e.message);
}
