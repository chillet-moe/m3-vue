// @vitest-environment jsdom
import { createApp, h, nextTick } from 'vue';
import { expect, it } from 'vitest';
import { DatePicker, DateRangePicker, PaginationNext, PaginationPrevious, TimePicker } from '@/index';
import { componentAnatomyPlugin, type ComponentAnatomy } from '../plugins/component-anatomy';
import { additionalAnatomyParts } from '../plugins/component-anatomy-parts';

it('documents the parts rendered by both picker modes and pagination steps', async () => {
  const plugin = componentAnatomyPlugin({
    components: 'src/components/**/*.vue',
  });
  await plugin.buildStart();
  const documentSource = plugin.load('\0virtual:component-anatomy')!;
  const anatomy: Record<string, ComponentAnatomy> = JSON.parse(documentSource.slice('export default '.length));
  const host = document.createElement('div');
  const bounds = { min: '2026-01-01', max: '2027-12-31', today: '2026-10-01' };
  const app = createApp(() => [
    h(DatePicker, bounds),
    h(DateRangePicker, bounds),
    h(TimePicker, { inputMode: 'clock' }),
    h(TimePicker, { inputMode: 'keyboard' }),
    h(PaginationNext),
    h(PaginationPrevious),
  ]);

  app.mount(host);
  try {
    for (const scope of ['date-picker', 'date-range-picker', 'time-picker', 'pagination'] as const) {
      const rendered = new Set<string>();
      const collect = () => {
        for (const part of host.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part]`)) {
          rendered.add(part.dataset.part!);
        }
      };

      collect();
      if (scope === 'date-picker' || scope === 'date-range-picker') {
        for (const control of ['month-switch', 'year-switch']) {
          host.querySelector<HTMLButtonElement>(`[data-scope="${scope}"][data-part="${control}"]`)!.click();
          await nextTick();
          collect();
        }
      }

      const documented = new Set(anatomy[scope]!.parts.map(({ part }) => part));
      expect(
        [...rendered].filter((part) => !documented.has(part)),
        scope,
      ).toEqual([]);
      for (const { part } of additionalAnatomyParts[scope]) {
        expect(rendered.has(part), `${scope} ${part}`).toBe(true);
      }
    }
  } finally {
    app.unmount();
  }
});
