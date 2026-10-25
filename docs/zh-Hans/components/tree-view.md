---
title: 树形视图
---

<script setup lang="ts">
import { ref } from 'vue';
import TreeViewDefault from '../../demos/tree-view/TreeViewDefault.vue';
import TreeViewDefaultSrc from '../../demos/tree-view/TreeViewDefault.vue?raw';
import TreeViewSettings from '../../demos/tree-view/TreeViewSettings.vue';
import TreeViewSettingsSrc from '../../demos/tree-view/TreeViewSettings.vue?raw';
const props = ref({});
</script>

# 树形视图

紧凑的单选树形视图，适用于项目文件和设置类别。展开、选择与键盘焦点彼此独立。`TreeView` 使用 `TreeItem` 递归呈现数据；`useTree` 则为自定义标记提供相同行为。

<DemoContainer><TreeViewDefault v-bind="props" /></DemoContainer>

<AnatomyTable scope="tree-view" />

<AnatomyTable scope="tree-item" />

<ApiTable component="TreeView" v-model="props" :exclude="['items', 'modelValue', 'expanded', 'dir']" />

<ApiTable component="TreeItem" :exclude="['item']" />

<StyleTokenTable component="TreeView" />

## 示例

### 项目文件与操作

<DemoContainer :src="TreeViewDefaultSrc"><TreeViewDefault /></DemoContainer>

使用 `leading`、`label` 和 `trailing` 插槽自定义每一层。插槽接收 `{ item, selected, expanded, focused, disabled }`。标签和前置内容应保持非交互。按钮应放在 `trailing` 中，设置无障碍名称、绑定 `disabled`，并使用 `:tabindex="focused ? 0 : -1"`，避免其他行中的操作进入 Tab 顺序。操作不会选择或展开该行。计数仅用于视觉呈现；如有无障碍需要，请在 `label` 中说明其含义。

### 设置类别

<DemoContainer :src="TreeViewSettingsSrc"><TreeViewSettings /></DemoContainer>

将 `selectable: false` 用于分组类别。点击类别或按 Enter 会切换其展开状态，而不会更改已选设置。默认插槽可以显式呈现 `TreeItem`；传入的节点及顺序应与 `items` 相同。每个 `TreeItem` 都会呈现自己的子项，并递归转发插槽。

## 数据与状态

`items` 是递归的 `TreeNode` 数组，包含 `value`（全局唯一的字符串）、`label`（无障碍名称及按键搜索文本），以及可选的 `children`、`icon`、`count`、`disabled` 和 `selectable`。空的 `children` 会被视为叶节点。重复的 `value` 会被拒绝。

- `v-model` 保存一个已选值，或 `undefined`。父节点关闭时，隐藏的选择仍会保留。
- `v-model:expanded` 保存已展开分支的值。两个模型也都可以不绑定，由组件管理本地状态。
- `activate` 会报告行的默认操作（点击或按 Enter）。按 Space 只会选择。
- 将 `selectWhenFocused` 设为 `true` 可启用随焦点移动而选择；默认值为 `false`。
- 暴露的 `focus(value)` 方法可聚焦可见节点，但不会展开其祖先节点。
- 使用方向键仍可访问禁用节点以查看其内容，但不能激活、选择或切换。禁用分支也会禁用其后代。
- 聚焦节点被隐藏或移除时，焦点会回到最近的可见祖先，然后移至相邻可见节点。空树仍可聚焦。树外的焦点不会因更新而被抢占。

## 键盘与无障碍

为树设置 `aria-label` 或 `aria-labelledby`。组件提供 `tree`、`treeitem` 和 `group` 角色、层级、同级位置、展开与选择状态，以及 roving tab stop。分支折叠时，其子项会隐藏。行为遵循 [WAI-ARIA 树形视图模式](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)。

| 按键                  | 行为                                         |
| --------------------- | -------------------------------------------- |
| Up / Down             | 移至上一个 / 下一个可见节点，不循环          |
| Right                 | 展开分支，然后移至其第一个子项               |
| Left                  | 折叠分支，或移至其父项                       |
| Home / End            | 移至第一个 / 最后一个可见节点                |
| Enter                 | 选择并激活；切换不可选择的类别               |
| Space                 | 选择但不激活                                 |
| 字符                  | 按前缀查找可见标签；重复输入字符可循环匹配项 |
| `*`                   | 展开启用的同级分支                           |
| Tab / Shift+Tab       | 按文档正常顺序移动，包括已聚焦行的尾随操作   |
| F2                    | 聚焦第一个启用的尾随操作                     |
| 在尾随操作中按 Escape | 将焦点返回该行                               |

在 RTL 中，Left 和 Right 的方向会镜像。可传入 `dir` 或继承文档方向。输入内容会在 500 毫秒后开始新的前缀搜索。可编辑控件和嵌套操作触发的按键事件不会被当作树形导航处理。

## 无头用法

<SourceApiTable api="useTree" />

```ts
const tree = useTree({
  items: () => items.value,
  value: () => selected.value,
  onValueChange: (value) => {
    selected.value = value;
  },
  expanded: () => expanded.value,
  onExpandedChange: (values) => {
    expanded.value = values;
  },
});
```

`value` 和 `expanded` 的 ref / getter 是受控数据源；静态值会初始化本地状态。将 `rootAttrs.value` 绑定到树，将 `getItemAttrs(value)` 绑定到每个可聚焦节点，并将 `getGroupAttrs(value)` 绑定到嵌套子组。保留条目属性上的 `ref` 绑定，以便键盘导航移动 DOM 焦点。将行点击绑定到 `focus(value)` 和 `activate(value)`，将展开控制点击绑定到 `toggle(value)`。返回值还会暴露 `value`、`expanded`、`focusedValue`、`visibleItems`、`entries`、`select` 和 `setExpanded`。请在组件或 effect scope 中创建此组合式函数，使其响应式 watcher 随所属作用域一同释放。

## 布局与样式

紧凑行高为 32 dp；`density="comfortable"` 时为 40 dp。可使用上方公开 token 自定义尺寸和选中颜色。`--md-color-container`、`--md-color-on-container` 和 `--md-state-layer-color` 会保留库中的语义颜色上下文。根布局可向 `TreeView` 或 `TreeItem` 传入 class；内部样式请使用文档说明的 `data-scope` / `data-part` 结构。`row` 是完整宽度的视觉与交互表面；`root` 管理节点及其嵌套的 `group`。

树本身不会创建滚动容器。应由外层面板负责滚动，并将内边距放在滚动区域内部，将固定工具栏放在滚动区域之外。此组件不包含拖放、复选框选择、多选或虚拟滚动。
