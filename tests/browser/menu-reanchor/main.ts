import '@/styles/themes/default.css';
import { createApp, h, ref } from 'vue';
import Menu from '@/components/Menu/Menu.vue';
import MenuContainer from '@/components/Menu/MenuContainer.vue';
import MenuItem from '@/components/Menu/MenuItem.vue';
import MenuSubMenu from '@/components/Menu/MenuSubMenu.vue';
import { showDropdownElement } from '@/directives/Dropdown/helpers';
import Popover from '@/components/Popover/Popover.vue';
import { acquireAnchorName } from '@/internal/anchorName';

const menu = ref<InstanceType<typeof Menu>>();
const popover = ref<InstanceType<typeof Popover>>();
const open = ref(false);
const active = ref(0);
const changes = ref<boolean[]>([]);
const closed = ref(0);
const anchors = ['File', 'View', 'Help'];
function show(index: number, focus = false) {
  active.value = index;
  return menu.value!.show(focus, document.getElementById(`entry-${index}`)!);
}
Object.assign(window, {
  fixture: {
    checkAnchorNameReentrancy: () => {
      return ['', '--existing-anchor'].map((initialValue, index) => {
        let acquireDuringRestore = false;
        let releaseSecond: (() => void) | undefined;
        class ReentrantAnchor extends HTMLElement {
          static observedAttributes = ['style'];

          attributeChangedCallback() {
            if (!acquireDuringRestore) return;
            acquireDuringRestore = false;
            releaseSecond = acquireAnchorName(this, '--second-anchor');
          }
        }
        const tag = `reentrant-anchor-${index}`;
        customElements.define(tag, ReentrantAnchor);
        const anchor = document.createElement(tag);
        if (initialValue) anchor.style.setProperty('anchor-name', initialValue);
        const releaseFirst = acquireAnchorName(anchor, '--first-anchor');

        acquireDuringRestore = true;
        releaseFirst();
        const reacquired = anchor.style.getPropertyValue('anchor-name');
        releaseSecond!();
        return { reacquired, restored: anchor.style.getPropertyValue('anchor-name') };
      });
    },
    show,
    externalShow: (index: number) =>
      showDropdownElement(document.getElementById('menu')!, { source: document.getElementById(`entry-${index}`)! }),
    repeat: (focus = false) => menu.value!.show(focus),
    hide: () => menu.value!.hide(),
    popoverShow: (index?: number) =>
      popover.value!.show({ source: index === undefined ? undefined : document.getElementById(`entry-${index}`)! }),
  },
});
createApp(() =>
  h(
    'div',
    {
      style: 'padding: 80px',
      onKeydown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight' && !(event.target as HTMLElement).hasAttribute('aria-haspopup')) {
          event.preventDefault();
          void show((active.value + 1) % 3, true);
        }
      },
    },
    [
      h(
        'div',
        { style: 'display: flex; gap: 120px' },
        anchors.map((label, index) =>
          h(
            'button',
            {
              id: `entry-${index}`,
              onClick: () => show(index),
              onPointerenter: () => {
                if (open.value) void show(index);
              },
            },
            label,
          ),
        ),
      ),
      h(
        Menu,
        {
          ref: menu,
          id: 'menu',
          open: open.value,
          'onUpdate:open': (value: boolean) => {
            open.value = value;
            changes.value.push(value);
          },
          onClosed: () => closed.value++,
        },
        () =>
          h(MenuContainer, null, () => [
            h(MenuItem, { id: 'first' }, () => `${anchors[active.value]} first`),
            h(MenuItem, { id: 'second' }, () => 'Second'),
            h(MenuSubMenu, null, {
              trigger: () => h(MenuItem, { id: 'nested-trigger', submenu: true }, () => 'Nested'),
              default: () => h(MenuContainer, null, () => h(MenuItem, { id: 'nested-item' }, () => 'Child')),
            }),
          ]),
      ),
      h(Popover, { ref: popover, id: 'popover' }, () => h('button', { id: 'popover-content' }, 'Panel')),
      h('output', { id: 'changes' }, JSON.stringify(changes.value)),
      h('output', { id: 'closed' }, closed.value),
      h('button', { id: 'outside', style: 'position: fixed; bottom: 20px; right: 20px' }, 'Outside'),
    ],
  ),
).mount('#app');
