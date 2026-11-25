import { computed, defineComponent, h, type PropType, type VNodeChild } from 'vue';
import Icon from '@/components/Icon/Icon.vue';
import MenuContainer from './MenuContainer.vue';
import MenuDivider from './MenuDivider.vue';
import MenuGap from './MenuGap.vue';
import MenuItem from './MenuItem.vue';
import MenuLabel from './MenuLabel.vue';
import MenuSubMenu from './MenuSubMenu.vue';
import type { MenuActionContent, MenuContentItem, MenuContentKey, MenuSubmenuContent } from './MenuTypes';

type Segment = { type: 'gap'; key: MenuContentKey } | { type: 'group'; key: MenuContentKey; items: MenuContentItem[] };

function itemSlots(item: MenuActionContent | MenuSubmenuContent) {
  const slots: Record<string, () => VNodeChild> = {};
  if (item.leadingIcon) slots.leading = () => h(Icon, { name: item.leadingIcon });
  if (item.supportingText) slots.supporting = () => item.supportingText;
  if (item.badge) slots.badge = () => item.badge;
  if (item.trailingText) slots.trailingText = () => item.trailingText;

  if (item.trailingIcon) slots.trailing = () => h(Icon, { name: item.trailingIcon });

  return slots;
}

function renderItem(item: MenuContentItem, index: number): VNodeChild {
  const key = item.key ?? `${item.type ?? 'item'}-${index}`;
  switch (item.type) {
    case 'label':
      return h(MenuLabel, { key }, () => item.label);
    case 'divider':
      return h(MenuDivider, { key });
    case 'submenu':
      return h(
        MenuSubMenu,
        { key, color: item.color, size: item.size, shape: item.shape, debugSafeTriangle: item.debugSafeTriangle },
        {
          trigger: ({ open }: { open: boolean }) =>
            h(
              MenuItem,
              { label: item.label, submenu: true, submenuOpen: open, disabled: item.disabled },
              itemSlots(item),
            ),
          default: () => h(MenuContentRenderer, { items: item.items }),
        },
      );
    case 'item':
    case undefined:
      return h(
        MenuItem,
        {
          key,
          size: item.size,
          shape: item.shape,
          label: item.label,
          value: item.value,
          disabled: item.disabled,
          closeOnSelect: item.closeOnSelect,
          selected: item.selected,
          role: item.role,
          checked: item.checked,
        },
        itemSlots(item),
      );
    default:
      return null;
  }
}

const MenuContentRenderer = defineComponent({
  name: 'MenuContentRenderer',
  props: {
    items: { type: Array as PropType<readonly MenuContentItem[]>, required: true },
  },
  setup(props) {
    const segments = computed(() => {
      const result: Segment[] = [];
      let pending: MenuContentItem[] = [];

      function flushGroup(end: number) {
        if (!pending.length) return;
        result.push({ type: 'group', key: `auto-group-${end}`, items: pending });
        pending = [];
      }

      props.items.forEach((item, index) => {
        if (item.type === 'group') {
          flushGroup(index);
          result.push({ type: 'group', key: item.key ?? `group-${index}`, items: item.items });
        } else if (item.type === 'gap') {
          flushGroup(index);
          result.push({ type: 'gap', key: item.key ?? `gap-${index}` });
        } else {
          pending.push(item);
        }
      });

      flushGroup(props.items.length);
      return result;
    });

    return () =>
      segments.value.map((segment) =>
        segment.type === 'gap'
          ? h(MenuGap, { key: segment.key })
          : h(MenuContainer, { key: segment.key }, () => segment.items.map(renderItem)),
      );
  },
});

export default MenuContentRenderer;
