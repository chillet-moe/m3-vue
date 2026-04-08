import type { App } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { M3VuePlugin, m3VueDirectiveNames, m3VueDirectives } from './plugin';

describe('M3VuePlugin', () => {
  it('registers all exported directives with stable global names', () => {
    const directive = vi.fn();

    M3VuePlugin.install({
      directive,
    } as unknown as App);

    expect(m3VueDirectiveNames).toEqual(['tooltip', 'dropdown', 'dropdownMenu', 'contextMenu']);
    expect(directive.mock.calls).toEqual(m3VueDirectiveNames.map((name) => [name, m3VueDirectives[name]]));
  });
});
