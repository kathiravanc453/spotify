const https = require('https');
const fs = require('fs');

const titles = {
  'A. R. Rahman': 'A.R. Rahman',
  'S. P. Balasubrahmanyam': 'S.P. Balasubrahmanyam',
  'P. B. Sreenivas': 'P. B. Srinivas', 
  'Seerkazhi Govindarajan': 'Seerkazhi Govindarajan',
  'Malaysia Vasudevan': 'Malaysia Vasudevan',
  'Hariharan (singer)': 'Hariharan',
  'Shankar Mahadevan': 'Shankar Mahadevan',
  'Anirudh Ravichander': 'Anirudh Ravichander',
  'Sid Sriram': 'Sid Sriram',
  'Shreya Ghoshal': 'Shreya Ghoshal',
  'Swarnalatha': 'Swarnalatha',
  'Bombay Jayashri': 'Bombay Jayashri',
  'Chinmayi': 'Chinmayi',
  'Shweta Mohan': 'Shweta Mohan',
  'Andrea Jeremiah': 'Andrea Jeremiah',
  'Karthik (singer)': 'Karthik',
  'Benny Dayal': 'Benny Dayal',
  'Srinivas (singer)': 'Srinivas'
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
               console.log(appName + ' Found');
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
