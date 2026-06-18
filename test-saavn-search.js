async function test() {
  const q = "A.R. Rahman";
  const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(q)}&p=1&n=150&_format=json&_marker=0&ctx=web6dot0`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': 'L=tamil;' } });
  const data = await res.json();
  console.log("Total Results:", data.results?.length);
  if (data.results && data.results.length > 0) {
    console.log("First Result:", data.results[0].title || data.results[0].song);
  } else {
    console.log("No results or error:", data);
  }
}
test().catch(console.error);
