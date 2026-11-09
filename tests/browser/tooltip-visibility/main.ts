import '@/styles/theme.css';
import '@/styles/themes/default.css';
import { Tooltip } from '@/components/Tooltip';
import vTooltip from '@/directives/Tooltip/vTooltip';
import { createApp, h, withDirectives } from 'vue';

createApp({
  render: () =>
    h('div', { style: { margin: '160px', '--md-duration-fast': '250ms' } }, [
      withDirectives(h('button', { id: 'trigger' }, 'Target'), [[vTooltip, '#tip']]),
      h(Tooltip, { id: 'tip' }, () => 'Tooltip content'),
      h(Tooltip, { id: 'closed-tip' }, () => 'Unopened tooltip'),
    ]),
}).mount('#app');
