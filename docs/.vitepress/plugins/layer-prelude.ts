import type { Plugin } from 'vite';

export interface LayerPreludePluginOptions {
  layers: string[];
}

function escapeRegExp(source: string): string {
  return source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildLayerPrelude(layers: readonly string[]): string {
  return `@layer ${layers.join(', ')};`;
}

function buildPreludePattern(layers: readonly string[]): RegExp {
  const escapedLayers = layers.map((layer) => escapeRegExp(layer.trim()));
  return new RegExp(`@layer\\s+${escapedLayers.join('\\s*,\\s*')}\\s*;`, 'g');
}

function hasAllLayers(source: string, layers: readonly string[]): boolean {
  return layers.every((layer) => source.includes(`@layer ${layer}`));
}

function getPreludeInsertIndex(source: string): number {
  const leadingAtRules = source.match(/^(?:\s*@charset[^;]*;\s*)?(?:\s*@import[^;]*;\s*)*/);
  return leadingAtRules?.[0].length ?? 0;
}

function injectPrelude(source: string, layers: readonly string[]): string {
  const prelude = buildLayerPrelude(layers);
  const preludePattern = buildPreludePattern(layers);
  const cleanedSource = source.replace(preludePattern, '');
  const insertIndex = getPreludeInsertIndex(cleanedSource);
  return `${cleanedSource.slice(0, insertIndex)}${prelude}${cleanedSource.slice(insertIndex)}`;
}

export function layerPreludePlugin(options: LayerPreludePluginOptions): Plugin {
  const layers = options.layers.map((layer) => layer.trim()).filter(Boolean);
  return {
    name: 'vitepress:layer-prelude',
    enforce: 'post',
    apply: 'build',
    generateBundle(_, bundle) {
      if (!layers.length) {
        return;
      }
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'asset' || typeof chunk.source !== 'string') {
          continue;
        }
        if (!chunk.fileName.endsWith('.css')) {
          continue;
        }
        if (!hasAllLayers(chunk.source, layers)) {
          continue;
        }
        chunk.source = injectPrelude(chunk.source, layers);
      }
    },
  };
}
