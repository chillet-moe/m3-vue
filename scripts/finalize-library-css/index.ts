import { parse } from 'postcss';
import type { Plugin } from 'vite';

const layerOrderPattern = /@layer\b[^{};]*,[^{};]*;\s*/g;
const charsetPattern = /^(\s*@charset\s+[^;]+;\s*)/i;

function moveLayerOrderToTop(cssSource: string): string {
  const orderMatches = [...cssSource.matchAll(layerOrderPattern)];
  if (orderMatches.length === 0) {
    return cssSource;
  }

  const layerOrderLine = orderMatches[0][0].trim();
  const sourceWithoutLayerOrder = cssSource.replace(layerOrderPattern, '');

  const charsetMatch = sourceWithoutLayerOrder.match(charsetPattern);
  if (charsetMatch) {
    const charsetLine = charsetMatch[1];
    return `${charsetLine}${layerOrderLine}\n${sourceWithoutLayerOrder.slice(charsetLine.length)}`;
  }

  return `${layerOrderLine}\n${sourceWithoutLayerOrder}`;
}

function compactFormatting(cssSource: string): string {
  const root = parse(cssSource);

  // Keep selector and value tokens intact, including the precision of custom property calculations.
  root.walk((node) => {
    if (node.type === 'comment' && !/^!|@license|@preserve|copyright|SPDX-License-Identifier/i.test(node.text)) {
      node.remove();
      return;
    }

    if (/^\s*$/.test(node.raws.before ?? '')) node.raws.before = '';
    if ('nodes' in node && /^\s*$/.test(node.raws.after ?? '')) node.raws.after = '';

    if (node.type === 'decl') {
      if (node.value && /^\s*:\s*$/.test(node.raws.between ?? '')) node.raws.between = ':';
    } else if (typeof node.raws.between === 'string' && /^\s*$/.test(node.raws.between)) {
      node.raws.between = '';
    }
  });
  root.raws.after = '';
  return root.toString();
}

export default function finalizeLibraryCss(): Plugin {
  return {
    name: 'finalize-library-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== 'asset' || !output.fileName.endsWith('.css') || typeof output.source !== 'string') {
          continue;
        }

        if (!output.source.includes('@layer')) {
          continue;
        }

        output.source = compactFormatting(moveLayerOrderToTop(output.source));
      }
    },
  };
}
