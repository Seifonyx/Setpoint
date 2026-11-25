// The iPhone app's own copy of the legal pages, so it never needs the website to show them.
// Reads the app's legal pages here in ios/legal (privacy.html, terms.html, cookies.html, refunds.html) and writes
// ios/Setpoint/Resources/Legal.json:
// { pages: [{ id, title, meta, sections: [{ heading, blocks: [{ p: "markdown" } | { list: ["markdown", …] }] }] }] }
// Run after changing a legal page: node ios/legal/build.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..'), DIR = __dirname;

const PAGES = ['privacy', 'terms', 'cookies', 'refunds'];

function decode(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Inline HTML to Markdown the app can show: bold, italics, links (other legal pages open inside the app). */
function inline(html) {
  let s = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<(b|strong)>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(i|em)>([\s\S]*?)<\/\1>/gi, '*$2*')
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
      const page = href.replace(/^\.\//, '').replace(/\.html(#.*)?$/, '');
      if (PAGES.includes(page)) return `[${text}](setpoint-legal://${page})`;
      if (href === './' || href === '/' || href.startsWith('index')) return text;
      return `[${text}](${href})`;
    })
    .replace(/<[^>]+>/g, '');
  return decode(s).replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
}

function page(id) {
  const html = fs.readFileSync(path.join(DIR, `${id}.html`), 'utf8');
  const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [, html])[1];
  const title = inline((main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [, id])[1]);
  const meta = inline((main.match(/<p class="meta"[^>]*>([\s\S]*?)<\/p>/i) || [, ''])[1]);
  const sections = [];
  for (const [, body] of main.matchAll(/<section[^>]*>([\s\S]*?)<\/section>/gi)) {
    const heading = inline((body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [, ''])[1]);
    const blocks = [];
    for (const [, tag, inner] of body.replace(/<h2[\s\S]*?<\/h2>/i, '').matchAll(/<(p|ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi)) {
      if (tag === 'p') { const t = inline(inner); if (t) blocks.push({ p: t }); }
      else blocks.push({ list: [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => inline(m[1])) });
    }
    sections.push({ heading, blocks });
  }
  if (!sections.length) throw new Error(`${id}.html: no sections found`);
  return { id, title, meta, sections };
}

const out = { pages: PAGES.filter(p => fs.existsSync(path.join(DIR, `${p}.html`))).map(page) };
const dest = path.join(ROOT, 'ios/Setpoint/Resources/Legal.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 1) + '\n');
console.log(`Legal.json: ${out.pages.map(p => `${p.id} (${p.sections.length} sections)`).join(', ')}`);
