import '@/styles/theme.css';
import '@/styles/themes/default.css';
import { Tooltip } from '@/components/Tooltip';
import vTooltip from '@/directives/Tooltip/vTooltip';
import { createApp, defineComponent, h, ref, withDirectives } from 'vue';
import { useDelegatedTooltip } from '@/composables/useDelegatedTooltip';

const standard = {
  render: () =>
    h('div', { style: { margin: '160px', '--md-duration-fast': '250ms' } }, [
      withDirectives(h('button', { id: 'trigger' }, 'Target'), [[vTooltip, '#tip']]),
      h(Tooltip, { id: 'tip' }, () => 'Tooltip content'),
      h(Tooltip, { id: 'closed-tip' }, () => 'Unopened tooltip'),
    ]),
};

const Delegated = defineComponent({
  setup() {
    const container = ref<HTMLElement>();
    const { tooltipSlots } = useDelegatedTooltip(
      container,
      'delegated-tip',
      (anchor) => anchor.dataset.tip ?? null,
      (target) => (target as Element | null)?.closest<HTMLElement>('[data-tip]') ?? null,
    );
    return () =>
      h('div', { ref: container, style: 'margin:160px;display:flex;gap:80px' }, [
        h('button', { id: 'first', 'data-tip': 'First' }, 'First'),
        h('button', { id: 'second', 'data-tip': 'Second' }, 'Second'),
        ...tooltipSlots.map((slot) => h(Tooltip, { id: slot.id, key: slot.id }, () => slot.tooltip ?? '')),
      ]);
  },
});

createApp(
  new URLSearchParams(location.search).has('delegated')
    ? {
        setup() {
          const mounted = ref(true);
          return () => [
            h(
              'button',
              {
                onClick: () => {
                  mounted.value = false;
                },
              },
              'Unmount tooltips',
            ),
            mounted.value ? h(Delegated) : null,
          ];
        },
      }
    : standard,
).mount('#app');
