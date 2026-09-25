---
title: v-dropdown
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

const selected = ref('无');

const dropdownBinding = {
  target: '#docs-dropdown-card',
};

function selectAction(name: string, event: MouseEvent) {
  selected.value = name;

  const currentTarget = event.currentTarget as HTMLElement | null;
  const popover = currentTarget?.closest('[popover]') as (HTMLElement & { hidePopover?: () => void }) | null;
  popover?.hidePopover?.();
}
</script>

# v-dropdown

`v-dropdown` 是用于从触发器切换 popover 表面的底层指令。它适用于菜单和自定义锚定浮层；库会处理触发器事件、锚点连接和焦点恢复。

<DemoContainer :viewport="false">
  <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; padding-block: 2rem;">
    <Button v-dropdown="dropdownBinding">打开自定义下拉菜单</Button>
    <Card
      id="docs-dropdown-card"
      popover="auto"
      style="inline-size: 14rem; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; position: fixed; inset: auto; inset-inline-start: anchor(start); inset-block-start: calc(anchor(bottom) + 0.25rem);"
    >
      <button type="button" style="all: unset; cursor: var(--md-cursor-action); padding: 0.75rem; border-radius: 0.5rem;" @click="selectAction('预览', $event)">
        预览
      </button>
      <button type="button" style="all: unset; cursor: var(--md-cursor-action); padding: 0.75rem; border-radius: 0.5rem;" @click="selectAction('分享', $event)">
        分享
      </button>
      <button type="button" style="all: unset; cursor: var(--md-cursor-action); padding: 0.75rem; border-radius: 0.5rem;" @click="selectAction('删除', $event)">
        删除
      </button>
    </Card>
    <div>已选择：{{ selected }}</div>
  </div>
</DemoContainer>

## 基本用法

将指令指向启用了 popover 的元素。

```vue
<button v-dropdown="'#menu'">打开菜单</button>

<div
  id="menu"
  popover="auto"
  style="
    position: fixed;
    inset: auto;
    inset-inline-start: anchor(start);
    inset-block-start: calc(anchor(bottom) + 0.25rem);
  "
>
  ...
</div>
```

此指令会切换目标 popover，并设置 `position-anchor`，使 popover 能相对于触发器定位。

## 对象绑定

需要覆盖锚点或外部点击行为时，请使用对象形式。

```vue
<button
  v-dropdown="{
    target: '#menu',
    anchor: customAnchorElement,
    closeOnOutsideClick: false,
  }"
>
  打开菜单
</button>
```

<SourceApiTable api="vDropdown" type="DropdownTargetBinding" :show-signature="false" />

## 键盘和事件

- 点击会切换下拉菜单。
- `Enter`、`Space` 和 `ArrowDown` 会打开下拉菜单，并请求将焦点移至首项。
- `ArrowUp` 会打开下拉菜单，并请求将焦点移至末项。
- 下拉菜单关闭后，`Escape` 会将焦点恢复到触发器。
- 目标元素会派发 `m3-dropdown:show` 和 `m3-dropdown:hide` 自定义事件。

触发 `m3-dropdown:show` 时，其 `detail` 包含打开操作的来源元素和请求的焦点方向。菜单原语等组件可以使用这些信息正确设置键盘焦点。

## 说明

- `v-dropdown` 不会替你创建下拉元素。目标元素必须已存在。
- 目标应是 popover 表面，例如 `MenuContainer`、`Card`，或带有 `popover="auto"` 或 `popover="manual"` 的自定义元素。
- 自定义表面需自行负责布局样式。此指令只处理行为和锚点连接。

更高层的菜单表面请参阅 [Menu](/zh-Hans/components/menu)。
