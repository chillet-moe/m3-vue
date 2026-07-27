import type { App } from 'vue';
import { describe, expect, it, vi } from 'vite-plus/test';
import { M3VuePlugin, m3VueDirectiveNames, m3VueDirectives } from './plugin';

describe('M3VuePlugin', () => {
  it('registers all exported directives with stable global names', () => {
    const directive = vi.fn();
    const provide = vi.fn();

    M3VuePlugin.install({
      directive,
      provide,
    } as unknown as App);

    expect(m3VueDirectiveNames).toEqual(['tooltip', 'dropdown', 'dropdownMenu', 'contextMenu']);
    expect(directive.mock.calls).toEqual(m3VueDirectiveNames.map((name) => [name, m3VueDirectives[name]]));
    expect(provide).toHaveBeenCalledOnce();
  });
});
