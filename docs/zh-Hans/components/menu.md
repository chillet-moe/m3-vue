---
title: Menu
---

<script setup lang="ts">
import MenuDropdown from '../../demos/menu/MenuDropdown.vue';
import MenuDropdownSrc from '../../demos/menu/MenuDropdown.vue?raw';
import MenuContext from '../../demos/menu/MenuContext.vue';
import MenuContextSrc from '../../demos/menu/MenuContext.vue?raw';
import MenuSelectable from '../../demos/menu/MenuSelectable.vue';
import MenuSelectableSrc from '../../demos/menu/MenuSelectable.vue?raw';
import MenuWithSelect from '../../demos/menu/MenuWithSelect.vue';
import MenuWithSelectSrc from '../../demos/menu/MenuWithSelect.vue?raw';
import MenuDeclarative from '../../demos/menu/MenuDeclarative.vue';
import MenuDeclarativeSrc from '../../demos/menu/MenuDeclarative.vue?raw';
import MenuLinks from '../../demos/menu/MenuLinks.vue';
import MenuLinksSrc from '../../demos/menu/MenuLinks.vue?raw';
</script>

# Menu

Menu 支持下拉菜单、上下文菜单、子菜单和由对象驱动的菜单项渲染，并由组件组统一处理键盘与选择行为。

## 行尺寸

可在 Menu 上设置 `size` 统一调整所有菜单行，在 MenuItem 上设置以调整单行，或在 MenuSubMenu 上设置以调整一个分支。声明式菜单项和子菜单条目也接受 `size`。Select/Combobox 菜单会继承共享的行尺寸，其尺寸与输入框自身的尺寸相互独立。

尺寸比例、共享的 `rowSize` 默认值和密度行为，详见[行尺寸](../guides/styling#row-sizes)。

## 颜色

`color` 选择 `standard` 或 `vibrant` 调色板。显式属性优先于 `menuDefaultsContextKey` 中的 `color`，内置回退值为 `standard`。可在 `M3VuePlugin` 中设置 `menuColor` 作为应用默认值，或通过上下文配置子树。详见[组件默认值](/zh-Hans/getting-started#组件默认值)。

子菜单会继承父菜单解析后的颜色，除非显式覆盖。Select 和 Combobox 菜单也使用相同的共享偏好，其 `menuColor` 属性优先。

## 示例

### 下拉菜单

<DemoContainer :src="MenuDropdownSrc" :viewport="false">
  <MenuDropdown />
</DemoContainer>

### 上下文菜单

<DemoContainer :src="MenuContextSrc" :viewport="false">
  <MenuContext />
</DemoContainer>

### 可选值

<DemoContainer :src="MenuSelectableSrc" :viewport="false">
  <MenuSelectable />
</DemoContainer>

### 内嵌 Select

选择 Select 选项会关闭 Select 菜单，但不会关闭外层 Menu。

<DemoContainer :src="MenuWithSelectSrc" :viewport="false">
  <MenuWithSelect />
</DemoContainer>

### 声明式条目

<DemoContainer :src="MenuDeclarativeSrc" :viewport="false">
  <MenuDeclarative />
</DemoContainer>

### 链接

让 `MenuItem` 本身渲染为可交互链接。不要在 `MenuItem` 内嵌套 `<a>`，否则会产生无效的交互标记。

<DemoContainer :src="MenuLinksSrc" :viewport="false">
  <MenuLinks />
</DemoContainer>

使用 Vue Router 时，让 `MenuItem` 保持为渲染出的锚点，并通过 `RouterLink` 的 `custom` 插槽提供导航状态：

```vue
<RouterLink custom to="/settings" v-slot="{ href, navigate }">
  <MenuItem :href="href" @click="navigate">
    设置
  </MenuItem>
</RouterLink>
```

## 浮动表面

共享主题颜色、边框、阴影，以及包含嵌套菜单和对话框的交互式示例，请参阅[浮动表面 token](../utilities/elevation.md#floating-surfaces)。

## 密度

菜单行会继承 `--md-density`，包括嵌套菜单以及 Select/Combobox 选项。每级密度会调整 4dp 的垂直留白；上下内边距最低为 4dp。标签、图标和多行内容保持原有尺寸。若要保留菜单的默认间距，可在菜单上设置 `--md-density: 0`。显式设置 `--md-menus-menu-item-height`、`--md-menus-menu-item-top-space` 和 `--md-menus-menu-item-bottom-space` 时，对应值会覆盖密度规则。

## 参考

<ApiTable component="Menu" />

<StyleTokenTable component="Menu" />

### Menu

原生弹出层关闭时会立即触发 `update:open(false)`。如果清理操作需要等到 Menu 自身的透明度和缩放退出动画结束后再执行，请使用 `closed`。插槽菜单内容内部的动画不计入等待范围。

`Menu.show(focusFirst = false, source?)` 也可在 Menu 已打开时调用。传入新的 `source` 会更新 CSS 锚点并保持 Menu 打开；不会触发 `update:open(false)` 或 `closed`，并会关闭所有子菜单。传入相同的 `source` 或省略 `source` 会保留当前锚点。每次以 `focusFirst: true` 调用都会明确请求聚焦首个菜单项；`false` 则保留当前焦点。Menu 关闭后，若再次调用时未传入 `source`，不会复用先前显式指定的 source。

### MenuContainer

<ApiTable component="MenuContainer" />

### MenuItem

<ApiTable component="MenuItem" />

### MenuSubMenu

<ApiTable component="MenuSubMenu" />

### MenuDivider

<ApiTable component="MenuDivider" />

### MenuGap

<ApiTable component="MenuGap" />

### MenuLabel

<ApiTable component="MenuLabel" />

<AnatomyTable scope="menu" />

<AnatomyTable scope="menu-item" />

## Composable

### useMenu

<SourceApiTable api="useMenu" />
