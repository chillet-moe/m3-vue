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

## 参考

<ApiTable component="Menu" />

<StyleTokenTable component="Menu" />

### Menu

原生弹出层关闭时会立即触发 `update:open(false)`。如果清理操作需要等到 Menu 自身的透明度和缩放退出动画结束后再执行，请使用 `closed`。插槽菜单内容内部的动画不计入等待范围。

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
