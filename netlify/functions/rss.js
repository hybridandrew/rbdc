const https = require('https');
const http  = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RBDCSite/1.0)' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseItems(xml, count = 3) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < count) {
    const block = match[1];
    const get = tag => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>|<${tag}[^>]*>([^<]*)<\/${tag}>`));
      return m ? (m[1] || m[2] || '').trim() : '';
    };
    const getPubDate = () => {
      const m = block.match(/<pubDate>([^<]*)<\/pubDate>/);
      return m ? m[1].trim() : '';
    };
    // Letterboxd-specific: star rating
    const ratingMatch = block.match(/letterboxd:memberRating>([^<]+)<\/letterboxd:memberRating/) ||
                        block.match(/<description>[^<]*(\d+\.?\d*)\s*star/i);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

    // Goodreads-specific: extract book cover from description img tag
    const imgMatch = block.match(/<img[^>]+src="([^"]+)"/);
    const cover = imgMatch ? imgMatch[1] : null;

    items.push({
      title:   get('title'),
      link:    get('link'),
      date:    getPubDate(),
      rating,
      cover,
    });
  }
  return items;
}

exports.handler = async event => {
  const source = event.queryStringParameters?.source;

  const feeds = {
    letterboxd: 'https://letterboxd.com/hybridxer0/rss/',
    goodreads:  process.env.GOODREADS_RSS_URL,
  };

  if (!feeds[source]) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid source. Use ?source=letterboxd or ?source=goodreads' }) };
  }

  try {
    const xml   = await fetch(feeds[source]);
    const items = parseItems(xml, source === 'letterboxd' ? 1 : 1);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=3600' },
      body: JSON.stringify({ source, items }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
