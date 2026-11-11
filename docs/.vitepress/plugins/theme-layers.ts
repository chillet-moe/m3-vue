import { atRule, parse } from 'postcss';
import { fileURLToPath } from 'node:url';
import { normalizePath, type Plugin } from 'vite';

export const docsThemeLayers = ['vitepress-defaults', 'docs-theme'] as const;

const defaultThemeDirectory = normalizePath(fileURLToPath(new URL('.', import.meta.resolve('vitepress/theme'))));
const siteStylesheet = normalizePath(fileURLToPath(new URL('../theme/style.css', import.meta.url)));

export function themeLayersPlugin(): Plugin {
  return {
    name: 'm3-vue:docs-theme-layers',
    enforce: 'pre',
    transform(source, id) {
      const [file = '', query] = id.split('?', 2);
      const isCss = file.endsWith('.css') || new URLSearchParams(query).get('type') === 'style';
      if (!isCss) return;

      const [defaults, site] = docsThemeLayers;
      const layer = file === siteStylesheet ? site : file.startsWith(defaultThemeDirectory) ? defaults : undefined;
      if (!layer) return;

      const root = parse(source, { from: id });
      const block = atRule({ name: 'layer', params: layer, nodes: [] });
      root.each((node) => {
        if (node.type === 'atrule' && node.name === 'import') {
          // Imports stay at the stylesheet root while their rules join the same layer.
          node.params = node.params.replace(/^(url\([^)]*\)|"[^"]*"|'[^']*')/, `$1 layer(${layer})`);
        } else if (node.type !== 'atrule' || !['charset', 'namespace'].includes(node.name)) {
          block.append(node);
        }
      });
      root.append(block);
      const result = root.toResult({ map: { inline: false, annotation: false } });
      return { code: result.css, map: result.map.toString() };
    },
  };
}
