import https from 'https';

const url = "https://res.cloudinary.com/dm1cwbbfg/video/upload/v1780407219/Harris_Jayaraj_-_Venaam_Machan_gp3pt4.jpg";

https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
}).on('error', (e) => {
  console.error(e);
});
