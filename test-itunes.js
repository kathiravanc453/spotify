import https from 'https';

const titles = [
  "Malaiyoram Veesum Kaatr",
  "NATTU SARAKKU SONG P",
  "Oh Podu Nenju Thudikuthu",
  "En Jeevan Paduthu Neetha",
  "Anirudh Ravichander Local",
  "Vijay Vaadi Vaadi"
];

const fetchArt = (title) => {
  return new Promise((resolve) => {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&country=in&media=music&entity=song&limit=1`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ title, found: parsed.resultCount > 0 });
        } catch (e) {
          resolve({ title, found: false, error: e.message });
        }
      });
    }).on('error', () => resolve({ title, found: false }));
  });
};

async function test() {
  for (const t of titles) {
    const res = await fetchArt(t);
    console.log(res);
  }
}

test();
