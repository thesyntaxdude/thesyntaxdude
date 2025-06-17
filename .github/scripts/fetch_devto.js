const fs = require('fs');
const Parser = require('rss-parser');
const parser = new Parser();

(async () => {
  const feed = await parser.parseURL('https://dev.to/feed/thesyntaxdude');
  const items = feed.items.slice(0, 3);

  const lines = items.map(item => {
    const img = item.enclosure ? item.enclosure.url : 'https://res.cloudinary.com/practicaldev/image/fetch/s--default--/c_imagga_scale,f_auto,fl_progressive,h_250,q_auto,w_400/https://dev.to/social_previews/default.png';
    return `<a href="${item.link}" target="_blank" style="display:inline-block;margin:10px;text-decoration:none;">
      <img src="${img}" alt="${item.title}" width="300" style="border-radius:8px"/><br/>
      <strong>${item.title}</strong>
    </a>`;
  });

  const readmePath = './README.md';
  let readme = fs.readFileSync(readmePath, 'utf8');

  const start = '<!-- DEVTO:START -->';
  const end = '<!-- DEVTO:END -->';
  const before = readme.split(start)[0] + start + '\n\n';
  const after = '\n\n' + end + readme.split(end)[1];

  const newContent = before + lines.join('\n') + after;
  fs.writeFileSync(readmePath, newContent);
})();
