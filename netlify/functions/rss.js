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

function parseItems(xml, source, count = 1) {
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

    // Letterboxd: rating ONLY from dedicated tag — never from description
    let rating = null;
    if (source === 'letterboxd') {
      const ratingMatch = block.match(/<letterboxd:memberRating>([^<]+)<\/letterboxd:memberRating>/);
      if (ratingMatch) rating = parseFloat(ratingMatch[1]);
    }

    // Get raw description block regardless of CDATA or plain text
    const getRaw = tag => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    };

    // Thumbnail
    let cover = null;

    const desc = getRaw('description');
    const descImgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (descImgMatch) {
      // Upgrade Goodreads tiny thumbnails to full size
      cover = descImgMatch[1].replace(/\._S[XY]\d+_/g, '');
    }

    // Goodreads: image_url tag as fallback
    if (!cover) {
      const imageUrl = block.match(/<image_url>\s*([^<\s]+)\s*<\/image_url>/);
      if (imageUrl) cover = imageUrl[1].replace(/\._S[XY]\d+_/g, '');
    }

    // Clean title: strip trailing year, dash, and star ratings Letterboxd appends
    let title = get('title')
      .replace(/\s*-\s*[★☆✭✫½]+.*$/, '')  // strip " - ★★★★★" suffix
      .replace(/,?\s*\d{4}\s*-?\s*$/, '')   // strip trailing year ", 2023 -"
      .trim();

    items.push({ title, link: get('link'), date: getPubDate(), rating, cover });
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
    const items = parseItems(xml, source, 1);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=3600' },
      body: JSON.stringify({ source, items }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
