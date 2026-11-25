---
title: Menu
---

<script setup lang="ts">
import MenuCheckbox from '../../demos/menu/MenuCheckbox.vue';
import MenuCheckboxSrc from '../../demos/menu/MenuCheckbox.vue?raw';
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

## 基本菜单

### 下拉菜单和子菜单

带有 `submenu` 的 `MenuItem` 会显示尾随箭头。在 `MenuSubMenu` 的触发器插槽中绑定 `:submenu-open="open"`，以显示展开状态。使用 `#trailing` 替换箭头，或在声明式子菜单上设置 `trailingIcon`。

<DemoContainer :src="MenuDropdownSrc" :viewport="false">
  <MenuDropdown />
</DemoContainer>

### 上下文菜单

<DemoContainer :src="MenuContextSrc" :viewport="false">
  <MenuContext />
</DemoContainer>

## 选择

### 单选值和多选值

为 Menu 绑定 `v-model`，并为每个可选的 `MenuItem` 设置唯一的 `value`。单选值会选中一行；启用 `multiple` 后，模型值为数组。Menu 会根据每行的值推导其 `checked` 状态，以及 `menuitemradio` 或 `menuitemcheckbox` 角色。不要再单独维护每行的 checked 模型，也不要在点击处理程序中切换该值。

若要在连续选择时保持菜单打开，请设置 `:close-on-select="false"`。

<DemoContainer :src="MenuSelectableSrc" :viewport="false">
  <MenuSelectable />
</DemoContainer>

### 调用方管理状态

对于由现有布尔值管理的选项，省略 `value`：设置 `role="menuitemcheckbox"`，绑定 `checked`，并在行的点击处理程序中更新状态。对于由调用方管理的单选组，设置 `role="menuitemradio"`，根据共享值推导每行的 `checked`，并在激活时赋予相应值。

<DemoContainer :src="MenuCheckboxSrc" :viewport="false">
  <MenuCheckbox />
</DemoContainer>

### 交互和呈现

无论 `menuitemradio` 角色是从菜单模型推导得出还是显式设置，`MenuItem` 都会显示前置单选按钮；对于 `menuitemcheckbox` 角色则会显示复选框。指示器会反映行的 `checked` 和 `disabled` 状态。行本身接收焦点并处理激活。使用 `selected` 控制行的强调样式。

若要替换指示器，可提供 `#leading`，或在声明式条目上设置 `leadingIcon`。插槽会收到解析后的 `checked` 和 `disabled` 状态。例如，以下行会为当前排序顺序显示勾号：

```vue
<MenuItem value="name" label="名称">
  <template #leading="{ checked }">
    <Icon v-if="checked" name="check" aria-hidden="true" />
  </template>
</MenuItem>
```

上/下方向键会在可用行之间移动。Enter 或 Space 会激活当前聚焦的行；复选框会切换状态，单选项则会选中其值。Escape 会关闭菜单。子菜单使用右方向键进入、左方向键返回。

Presentation CheckBox 和 Radio 仅占用可见的方框或圆圈。独立控件的 target-size token 不会增加菜单内的占用空间。

## 其他组合

### 自定义菜单项内容

使用 `#leading` 和 `#trailing` 插入图标或色块等小型图形。若要在标签同一行显示快捷键或当前值，请使用 `#trailingText`。它使用菜单的文本样式，并可与默认子菜单箭头同时显示。使用 `#badge` 显示计数，或使用 `#supporting` 在第二行显示说明。

```vue
<MenuItem label="保存">
  <template #trailingText>Ctrl+S</template>
</MenuItem>
```

### 内嵌 Select

将 Select 等可独立获取焦点的控件放在 `MenuContainer` 中，并与菜单项作为同级内容。选择选项会关闭 Select 下拉菜单，同时保持外层 Menu 打开。

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

## 外观

### 行尺寸

可在 Menu 上设置 `size` 统一调整所有菜单行，在 MenuItem 上设置以调整单行，或在 MenuSubMenu 上设置以调整一个分支。声明式菜单项和子菜单条目也接受 `size`。Select/Combobox 菜单会继承共享的行尺寸，其尺寸与输入框自身的尺寸相互独立。

行高是最小值。在默认密度下，中等尺寸的行至少高 3rem，其中内容上下各有 0.75rem 内边距。自定义图片高度设为不超过 1.5rem，可使其保持在单行空间内。内容较高时，行也会随之增高。

尺寸比例、共享的 `rowSize` 默认值和密度行为，详见[行尺寸](../guides/styling#row-sizes)。

### 颜色

`color` 选择 `standard` 或 `vibrant` 调色板。显式属性优先于 `menuDefaultsContextKey` 中的 `color`，内置回退值为 `standard`。可在 `M3VuePlugin` 中设置 `menuColor` 作为应用默认值，或通过上下文配置子树。详见[组件默认值](/zh-Hans/getting-started#组件默认值)。

子菜单会继承父菜单解析后的颜色，除非显式覆盖。Select 和 Combobox 菜单也使用相同的共享偏好，其 `menuColor` 属性优先。

### 密度

菜单行会继承 `--md-density`，包括嵌套菜单以及 Select/Combobox 选项。每级密度会调整 4dp 的垂直留白；上下内边距最低为 4dp。标签、图标和多行内容保持原有尺寸。若要保留菜单的默认间距，可在菜单上设置 `--md-density: 0`。显式设置 `--md-menus-menu-item-height`、`--md-menus-menu-item-top-space` 和 `--md-menus-menu-item-bottom-space` 时，对应值会覆盖密度规则。

### 浮动表面

共享主题颜色、边框、阴影，以及包含嵌套菜单和对话框的交互式示例，请参阅[浮动表面 token](../utilities/elevation.md#floating-surfaces)。

## 参考

### Menu

<ApiTable component="Menu" />

<StyleTokenTable component="Menu" />

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
