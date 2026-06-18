async function test() {
  const url = `https://www.jiosaavn.com/api.php?__call=webapi.getLaunchData&api_version=4&_format=json&_marker=0&ctx=web6dot0&languages=tamil`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': 'L=tamil;' } });
  const data = await res.json();
  console.log("Trending 1:", data.new_trending?.[0]?.title);
  console.log("Trending 2:", data.new_trending?.[1]?.title);
  console.log("Playlist 1:", data.top_playlists?.[0]?.title);
  console.log("Album 1:", data.new_albums?.[0]?.title);
}
test();
