// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
import Tooltip from './Tooltip.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Tooltip', () => {
  it('uses hint popover by default and accepts an explicit popover mode', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h('div', [
          h(Tooltip, undefined, {
            default: () => 'Hint tooltip',
          }),
          h(
            Tooltip,
            {
              popover: 'manual',
            },
            {
              default: () => 'Manual tooltip',
            },
          ),
        ]);
      },
    });

    app.mount(container);
    await nextTick();

    const tooltips = container.querySelectorAll('.m3-tooltip');

    expect(tooltips[0]?.getAttribute('popover')).toBe('hint');
    expect(tooltips[1]?.getAttribute('popover')).toBe('manual');

    app.unmount();
  });
});
