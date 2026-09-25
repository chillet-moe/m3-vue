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

export default function fixCssLayerOrder(): Plugin {
  return {
    name: 'fix-css-layer-order',
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

        output.source = moveLayerOrderToTop(output.source);
      }
    },
  };
}
