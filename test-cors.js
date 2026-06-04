import https from 'https';

const url = "https://itunes.apple.com/search?term=sachein&country=in&media=music&entity=song&limit=1";

https.get(url, { headers: { origin: 'http://localhost:5173' } }, (res) => {
  console.log('Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
}).on('error', (e) => {
  console.error(e);
});
