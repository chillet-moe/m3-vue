// @vitest-environment jsdom
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import Radio from './Radio.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Radio', () => {
  it('renders a native radio input by default', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() => h(Radio, { checked: true, name: 'plan', value: 'pro', ariaLabel: 'Pro plan' }));

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-radio');
    const input = container.querySelector<HTMLInputElement>('.m3-radio-input');

    expect(root?.tagName).toBe('LABEL');
    expect(root?.dataset.checked).toBe('true');
    expect(input?.type).toBe('radio');
    expect(input?.checked).toBe(true);
    expect(input?.name).toBe('plan');
    expect(input?.value).toBe('pro');
    expect(input?.getAttribute('aria-label')).toBe('Pro plan');

    app.unmount();
  });

  it('keeps the public checked model and update event typed as booleans', () => {
    type Props = InstanceType<typeof Radio>['$props'];
    type UpdateChecked = NonNullable<Props['onUpdate:checked']>;

    expectTypeOf<Props['checked']>().toEqualTypeOf<boolean>();
    expectTypeOf<Parameters<UpdateChecked>>().toEqualTypeOf<[value: boolean]>();
  });

  it.each([
    ['with a form value', 'pro'],
    ['without a form value', undefined],
  ])('emits boolean checked updates %s', async (_name, value) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const checked = ref(false);
    const updates: unknown[] = [];

    const app = createApp(() =>
      h(Radio, {
        checked: checked.value,
        value,
        'onUpdate:checked': (nextChecked) => {
          updates.push(nextChecked);
          checked.value = nextChecked;
        },
      }),
    );

    app.mount(container);
    await nextTick();

    const input = container.querySelector<HTMLInputElement>('.m3-radio-input');

    input?.click();
    await nextTick();

    expect(updates).toEqual([true]);
    expect(input?.checked).toBe(true);

    if (input) {
      input.checked = false;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    await nextTick();

    expect(updates).toEqual([true, false]);
    expect(updates.every((nextChecked) => typeof nextChecked === 'boolean')).toBe(true);
    expect(input?.checked).toBe(false);

    app.unmount();
  });

  it('supports deriving a mutually exclusive group from one selected value', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const selected = ref('basic');

    const app = createApp(() =>
      h('div', [
        h(Radio, {
          checked: selected.value === 'basic',
          name: 'plan',
          value: 'basic',
          'onUpdate:checked': (nextChecked) => {
            if (nextChecked) selected.value = 'basic';
          },
        }),
        h(Radio, {
          checked: selected.value === 'pro',
          name: 'plan',
          value: 'pro',
          'onUpdate:checked': (nextChecked) => {
            if (nextChecked) selected.value = 'pro';
          },
        }),
      ]),
    );

    app.mount(container);
    await nextTick();

    const inputs = container.querySelectorAll<HTMLInputElement>('.m3-radio-input');

    expect(Array.from(inputs, (input) => input.checked)).toEqual([true, false]);

    inputs[1]?.click();
    await nextTick();

    expect(selected.value).toBe('pro');
    expect(Array.from(inputs, (input) => input.checked)).toEqual([false, true]);

    app.unmount();
  });

  it('renders only the visual radio in presentation mode', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(() => h(Radio, { checked: true, presentation: true }));

    app.mount(container);
    await nextTick();

    const root = container.querySelector<HTMLElement>('.m3-radio');

    expect(root?.tagName).toBe('SPAN');
    expect(root?.dataset.presentation).toBe('true');
    expect(root?.dataset.checked).toBe('true');
    expect(root?.getAttribute('aria-hidden')).toBe('true');
    expect(root?.hasAttribute('data-state-layer-hover-target')).toBe(false);
    expect(container.querySelector('.m3-state-layer')).toBeNull();
    expect(container.querySelector('.m3-radio-input')).toBeNull();

    app.unmount();
  });
});
