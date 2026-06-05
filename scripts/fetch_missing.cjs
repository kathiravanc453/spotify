const https = require('https');
const fs = require('fs');

const titles = {
  'Sirkazhi Govindarajan': 'Seerkazhi Govindarajan',
  'Bombay Jayashri': 'Bombay Jayashri',
  'Dhee': 'Dhee',
  'Shakthisree Gopalan': 'Shakthisree Gopalan',
  'Mahalakshmi Iyer': 'Mahalakshmi Iyer',
  'Shashaa Tirupati': 'Shashaa Tirupati'
};

const mapPath = 'src/data/artistImages.json';
let existingMap = {};
if (fs.existsSync(mapPath)) {
  existingMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
}

async function fetchWiki() {
  for (const [wikiTitle, appName] of Object.entries(titles)) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=500`;
    await new Promise(r => {
      https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          try {
            const j = JSON.parse(d);
            const p = j.query.pages;
            const pid = Object.keys(p)[0];
            if (pid !== '-1' && p[pid].thumbnail) {
               console.log(appName + ' Found: ' + p[pid].thumbnail.source);
               existingMap[appName] = p[pid].thumbnail.source;
            }
            else {
               console.log(appName + ' NOT_FOUND');
            }
          } catch(e) { console.log(appName + ' ERROR'); }
          r();
        });
      });
    });
  }
  fs.writeFileSync(mapPath, JSON.stringify(existingMap, null, 2));
}
fetchWiki();
