// @vitest-environment jsdom
import { createApp, defineComponent, h, nextTick, shallowRef } from 'vue';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import DatePicker from '@/components/DatePicker/DatePicker.vue';
import DateRangePicker from '@/components/DateRangePicker/DateRangePicker.vue';
import Select from '@/components/Select/Select.vue';
import TextField from '@/components/TextField/TextField.vue';
import TimePicker from '@/components/TimePicker/TimePicker.vue';
import { M3VuePlugin } from '@/plugin';
import { provideM3Locale, useM3Locale } from './context';
import { en } from './en';
import type { M3LocaleDefinition } from './types';
import { zhHans } from './zh-Hans';
import { zhHant } from './zh-Hant';

const mountedApps: ReturnType<typeof createApp>[] = [];

afterEach(() => {
  for (const app of mountedApps.splice(0)) {
    app.unmount();
  }
  document.body.innerHTML = '';
});

describe('localization', () => {
  it('reactively switches a provided locale definition', async () => {
    const locale = shallowRef<M3LocaleDefinition>(en);
    const Consumer = defineComponent({
      setup() {
        const context = useM3Locale();
        return () => h('div', { 'data-locale': context.locale.value }, context.messages.value.select.noMatchingOptions);
      },
    });
    const container = document.createElement('div');
    const app = createApp(Consumer);
    app.use(M3VuePlugin, { locale });
    mountedApps.push(app);
    app.mount(container);

    expect(container.firstElementChild?.getAttribute('data-locale')).toBe('en');
    expect(container.textContent).toBe('No matching options');

    locale.value = zhHans;
    await nextTick();

    expect(container.firstElementChild?.getAttribute('data-locale')).toBe('zh-Hans');
    expect(container.textContent).toBe('没有匹配的选项');
  });

  it('localizes picker, text field, and select accessibility text and keeps explicit props', async () => {
    const locale = shallowRef<M3LocaleDefinition>(zhHans);
    const Root = defineComponent({
      setup() {
        provideM3Locale({ locale });
        return () =>
          h('div', [
            h(DatePicker, {
              modelValue: '2026-07-27',
              confirmText: '提交',
            }),
            h(TimePicker, {
              modelValue: '09:30',
              format: '12h',
            }),
            h(DateRangePicker, {
              modelValue: {
                start: '2026-07-27',
                end: '2026-07-27',
              },
              calendars: 1,
            }),
            h(TextField, {
              modelValue: '',
              type: 'date',
              label: '生日',
            }),
            h(Select, {
              modelValue: undefined,
              options: [],
              filterable: true,
            }),
          ]);
      },
    });
    const container = document.createElement('div');
    const app = createApp(Root);
    mountedApps.push(app);
    app.mount(container);
    await nextTick();

    expect(container.querySelector('[data-part="previous-month"]')?.getAttribute('aria-label')).toBe('上个月');
    expect(container.querySelector('[data-part="mode-toggle"]')?.getAttribute('aria-label')).toBe('切换到文本输入');
    expect(container.querySelector('[data-part="period-selector"]')?.getAttribute('aria-label')).toBe('选择上午或下午');
    expect(container.querySelector('[data-part="period-option"]')?.textContent?.trim()).toBe('上午');
    expect(container.querySelector('.m3-date-range-picker')?.getAttribute('aria-label')).toBe('选择日期范围');
    expect(container.querySelector('.m3-date-range-picker [data-part="prompt"]')?.textContent?.trim()).toBe('开始日期');
    expect(container.querySelector('.m3-text-field-date-picker-button')?.getAttribute('aria-label')).toBe('选择日期');
    expect(container.querySelector('[data-scope="date-picker"][role="dialog"]')?.getAttribute('aria-label')).toBe(
      '选择日期',
    );
    expect(container.querySelector('.m3-select-empty')?.textContent?.trim()).toBe('没有匹配的选项');
    expect([...container.querySelectorAll('button')].some((button) => button.textContent?.trim() === '提交')).toBe(
      true,
    );

    locale.value = zhHant;
    await nextTick();

    expect(container.querySelector('[data-part="previous-month"]')?.getAttribute('aria-label')).toBe('上個月');
    expect(container.querySelector('.m3-select-empty')?.textContent?.trim()).toBe('沒有符合的選項');
  });
});
