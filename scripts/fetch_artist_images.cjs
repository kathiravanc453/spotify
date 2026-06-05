const https = require('https');
const fs = require('fs');

const artists = [
  "A.R. Rahman", "S.P. Balasubrahmanyam", "K. J. Yesudas", "T. M. Soundararajan", 
  "P. B. Srinivas", "Seerkazhi Govindarajan", "Malaysia Vasudevan", "Mano", 
  "Hariharan", "Unnikrishnan", "Srinivas", "Shankar Mahadevan", "Karthik", 
  "Haricharan", "Benny Dayal", "Naresh Iyer", "Vijay Yesudas", "Sid Sriram", 
  "Anirudh Ravichander", "Dhanush", "Sean Roldan", "S. P. Charan", "Ranjith", 
  "Javed Ali", "Sriram Parthasarathy",
  "P. Susheela", "S. Janaki", "K. S. Chithra", "Sujatha Mohan", "Swarnalatha", 
  "Anuradha Sriram", "Harini", "Bombay Jayashri", "Shreya Ghoshal", "Chinmayi", 
  "Saindhavi", "Shweta Mohan", "Andrea Jeremiah", "Jonita Gandhi", "Dhee", 
  "Shakthisree Gopalan", "Mahalakshmi Iyer", "Shashaa Tirupati"
];

const getWikiImage = (artist) => {
  return new Promise((resolve) => {
    let title = artist;
    if (title === 'Mano') title = 'Mano (singer)';
    if (title === 'Karthik') title = 'Karthik (singer)';
    if (title === 'Srinivas') title = 'Srinivas (singer)';
    if (title === 'Ranjith') title = 'Ranjith (singer)';
    if (title === 'Harini') title = 'Harini (singer)';
    if (title === 'Saindhavi') title = 'Saindhavi (singer)';
    if (title === 'Chinmayi') title = 'Chinmayi Sripaada';
    if (title === 'Unnikrishnan') title = 'P. Unnikrishnan';
    if (title === 'Dhanush') title = 'Dhanush';

    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=500`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId !== '-1' && pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve(null);
          }
        } catch (e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
};

async function run() {
  const map = {};
  for (const artist of artists) {
    const url = await getWikiImage(artist);
    console.log(`${artist}: ${url ? 'Found' : 'Not found'}`);
    if (url) map[artist] = url;
  }
  if (!fs.existsSync('src/data')) fs.mkdirSync('src/data');
  fs.writeFileSync('src/data/artistImages.json', JSON.stringify(map, null, 2));
  console.log('Saved to src/data/artistImages.json');
}
run();
