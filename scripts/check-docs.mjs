import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../docs/', import.meta.url));
const pages = [];
function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collect(path);
    else if (entry.name.endsWith('.md')) pages.push(path);
  }
}
collect(root);
const errors = [];
for (const page of pages) {
  const name = relative(root, page);
  // The package README is tooling documentation, not a localized site page.
  if (name !== 'README.md') {
    const counterpart = name.startsWith('zh-Hans/') ? name.slice(8) : `zh-Hans/${name}`;
    if (!existsSync(join(root, counterpart))) errors.push(`${name}: missing translation ${counterpart}`);
  }
  const content = readFileSync(page, 'utf8').replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
  // Check authored local Markdown links. VitePress validates rendered page links during its build.
  for (const match of content.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const href = match[1];
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) continue;
    const path = decodeURIComponent(href.split(/[?#]/)[0]);
    if (!path) continue;
    const target = path.startsWith('/') ? resolve(root, `.${path}`) : resolve(dirname(page), path);
    const candidates =
      extname(target) === '.html'
        ? [target.slice(0, -5) + '.md']
        : extname(target)
          ? [target]
          : [target + '.md', join(target, 'index.md')];
    if (!candidates.some(existsSync)) errors.push(`${name}: missing link target ${href}`);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Documentation checks passed: ${pages.length} pages, translation pairs and local links.`);
}
