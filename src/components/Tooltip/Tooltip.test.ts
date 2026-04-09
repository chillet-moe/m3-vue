// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import Tooltip from './Tooltip.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Tooltip', () => {
  it('uses hint popover by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(Tooltip, undefined, {
          default: () => 'Tooltip',
        });
      },
    });

    app.mount(container);
    await nextTick();

    const tooltip = container.querySelector('.m3-tooltip');

    expect(tooltip?.getAttribute('popover')).toBe('hint');

    app.unmount();
  });

  it('uses the provided popover value', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(
          Tooltip,
          {
            popover: 'manual',
          },
          {
            default: () => 'Tooltip',
          },
        );
      },
    });

    app.mount(container);
    await nextTick();

    const tooltip = container.querySelector('.m3-tooltip');

    expect(tooltip?.getAttribute('popover')).toBe('manual');

    app.unmount();
  });
});
