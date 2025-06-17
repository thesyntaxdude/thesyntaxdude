const fs = require('fs');
const Parser = require('rss-parser');
const parser = new Parser();

// Dynamically import node-fetch (ESM-compatible)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function getFeaturedImage(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const match = html.match(/<meta property="og:image" content="(.*?)"/);
    return match ? match[1] : null;
  } catch (err) {
    console.error(`Failed to fetch image for ${url}:`, err);
    return null;
  }
}

(async () => {
  const feed = await parser.parseURL('https://dev.to/feed/thesyntaxdude');
  const posts = feed.items.slice(0, 3);

  const postMarkdown = await Promise.all(posts.map(async (post) => {
    const imageUrl = await getFeaturedImage(post.link);
    const title = post.title;
    const link = post.link;

    return `
<a href="${link}" target="_blank">
  <img src="${imageUrl}" width="300" alt="${title}" style="border-radius:10px;margin-bottom:8px"/><br/>
  <strong>${title}</strong>
</a>
<br/><br/>`;
  }));

  const start = '<!-- DEVTO:START -->';
  const end = '<!-- DEVTO:END -->';
  const readme = fs.readFileSync('README.md', 'utf8');

  const newContent = readme.replace(
    new RegExp(`${start}[\\s\\S]*?${end}`),
    `${start}\n\n${postMarkdown.join('\n')}\n${end}`
  );

  fs.writeFileSync('README.md', newContent);
})();
