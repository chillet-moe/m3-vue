import { createApp, h } from 'vue';
import { Button, Icon } from '@/index';

createApp({
  render() {
    return [
      ...['Arial', 'Georgia'].flatMap((fontFamily) =>
        [16, 32, 48].flatMap((fontSize) =>
          [undefined, '1.5em'].map((size) =>
            h('div', { class: 'text-case', style: { fontFamily, fontSize: `${fontSize}px`, lineHeight: 1.5 } }, [
              h(Icon, { name: 'upload', variant: 'inline', size }),
              // A baseline-aligned x-height box measures the surrounding text's center
              // without depending on an external icon font or on glyph ink bounds.
              h('span', {
                class: 'text-center',
                style: { display: 'inline-block', width: '1px', height: '1ex', verticalAlign: 'baseline' },
              }),
              'Export 导出',
            ]),
          ),
        ),
      ),
      ...['flex', 'grid'].map((display) =>
        h('div', { class: 'centered-case', style: { display, alignItems: 'center', height: '80px' } }, [
          h(Icon, { name: 'upload', variant: 'inline' }),
        ]),
      ),
      h(Button, { class: 'button-case', leadingIcon: 'upload' }, { default: () => 'Export' }),
      h(
        Button,
        { class: 'button-case' },
        {
          leading: () => h(Icon, { name: 'upload', variant: 'inline' }),
          default: () => 'Export',
        },
      ),
      h('div', [h(Icon, { class: 'standalone', name: 'upload' })]),
    ];
  },
}).mount('#app');
