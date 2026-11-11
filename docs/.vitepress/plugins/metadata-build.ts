import type { Plugin } from 'vite';

export function createMetadataBuildStart(generate: () => Promise<void>): NonNullable<Plugin['buildStart']> {
  let generation: Promise<void> | undefined;

  return async function () {
    if (this.environment.mode !== 'build' || this.meta.watchMode) {
      await generate();
      return;
    }

    // The client and SSR bundles in a VitePress build use the same plugin instance.
    generation ??= generate().catch((error: unknown) => {
      generation = undefined;
      throw error;
    });
    await generation;
  };
}
