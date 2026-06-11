import fs from 'fs';
import https from 'https';
import path from 'path';

const POPULAR_ACTORS = [
  "Vijay (actor)", "Ajith Kumar", "Suriya", "Vikram (actor)", "Dhanush", 
  "Vijay Sethupathi", "Sivakarthikeyan", "Karthi", 
  "Rajinikanth", "Kamal Haasan", "Sivaji Ganesan", 
  "M. G. Ramachandran", "Gemini Ganesan", "Jaishankar"
];

async function getWikiImage(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=500&redirects=1`;
  
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'RhythmixApp/1.0 (contact@example.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const pages = parsed.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
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

async function fetchImages() {
  const images = {};
  for (let actor of POPULAR_ACTORS) {
    let img = await getWikiImage(actor);
    
    // Clean name for the mapping (remove " (actor)")
    const cleanName = actor.replace(' (actor)', '');
    images[cleanName] = img || `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}`;
    console.log(`[Fetched] ${cleanName}: ${img ? 'Success' : 'Failed'} -> ${img}`);
  }
  
  fs.writeFileSync('actor_images.json', JSON.stringify(images, null, 2));
  console.log('Saved to actor_images.json');
}

fetchImages();
