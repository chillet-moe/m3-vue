---
title: 树形视图
---

<script setup lang="ts">
import { ref } from 'vue';
import TreeViewDefault from '../../demos/tree-view/TreeViewDefault.vue';
import TreeViewDefaultSrc from '../../demos/tree-view/TreeViewDefault.vue?raw';
import TreeViewSettings from '../../demos/tree-view/TreeViewSettings.vue';
import TreeViewSettingsSrc from '../../demos/tree-view/TreeViewSettings.vue?raw';
import TreeViewAsync from '../../demos/tree-view/TreeViewAsync.vue';
import TreeViewAsyncSrc from '../../demos/tree-view/TreeViewAsync.vue?raw';
import TreeViewVirtual from '../../demos/tree-view/TreeViewVirtual.vue';
import TreeViewVirtualSrc from '../../demos/tree-view/TreeViewVirtual.vue?raw';
const props = ref({});
</script>

# 树形视图

紧凑的单选树形视图，适用于项目文件和设置类别。展开、选择与键盘焦点彼此独立。`useTree` 会生成有序的可见节点列表；`TreeView` 使用 `TreeItem` 呈现该列表。数据和交互状态独立于已挂载的行。

<DemoContainer><TreeViewDefault v-bind="props" /></DemoContainer>

<AnatomyTable scope="tree-view" />

<AnatomyTable scope="tree-item" />

<ApiTable component="TreeView" v-model="props" :exclude="['items', 'modelValue', 'expanded', 'dir']" />

<ApiTable component="TreeItem" :exclude="['item']" />

<StyleTokenTable component="TreeView" />

## 示例

### 项目文件与操作

<DemoContainer :src="TreeViewDefaultSrc"><TreeViewDefault /></DemoContainer>

使用 `leading`、`label` 和 `trailing` 插槽自定义每一行。插槽接收 `{ item, selected, expanded, focused, disabled, branch, busy }`。标签和前置内容应保持非交互。按钮应放在 `trailing` 中，设置无障碍名称、绑定 `disabled`，并使用 `:tabindex="focused ? 0 : -1"`，避免其他行中的操作进入 Tab 顺序。操作不会选择或展开该行。计数仅用于视觉呈现；如有无障碍需要，请在 `label` 中说明其含义。

### 设置类别

<DemoContainer :src="TreeViewSettingsSrc"><TreeViewSettings /></DemoContainer>

将 `selectable: false` 用于分组类别。点击类别或按 Enter 会切换其展开状态，而不会更改已选设置。默认插槽接收 `{ tree }`，可以显式呈现 `tree.visibleItems.value`。每个 `TreeItem` 只呈现一行，不会递归挂载子项。请使用节点值作为 key，并保留可见列表的顺序。

### 异步加载子项

<DemoContainer :src="TreeViewAsyncSrc"><TreeViewAsync /></DemoContainer>

如果分支可以在子项加载前展开，请设置 `hasChildren: true`。加载期间设置 `busy: true`，以暴露 `aria-busy`。数据到达后填入 `children`。非空的子项也会确立分支；否则 `hasChildren` 默认为 `false`。如果结果为空，调用方可以保留目录作为可展开分支，或设置 `hasChildren: false` 将其变为叶节点。

请求、缓存、取消和错误由应用负责。观察展开模型以启动加载；使用插槽呈现进度和重试控件。示例会在折叠或卸载时取消待处理请求，并保留成功加载的子项供后续展开使用。重试按钮被进度指示器替换前，示例也会恢复行焦点。生产环境的加载器应在数据源变化时丢弃过期响应。树不会发起请求，也不会创建已加载子项的第二份副本。

### 外部虚拟滚动

<DemoContainer :src="TreeViewVirtualSrc"><TreeViewVirtual /></DemoContainer>

<<< @/demos/tree-view/TreeVirtualRows.vue

此示例使用应用中的 TanStack Virtual 实例呈现 10,000 个文件。TanStack 仅作为文档示例依赖；组件库不会导入它，也不负责滚动容器。

- 呈现 `tree.visibleItems.value` 的窗口，并以 `entry.node.value` 作为 key。`tree.visibleIndexes.value` 会将节点值映射到行索引。
- 使用 `focusRequest(value)` 将对应索引滚动到视口中。此同步通知会在库聚焦该行之前运行；如果行尚未挂载，则会在 Vue 下一次渲染后聚焦。无头用法则使用 `onFocusRequest`。将焦点索引保留在 TanStack 的 `rangeExtractor` 中，避免手动滚动时卸载活动行及其尾随控件。
- 由应用负责行尺寸测量和滚动视口。示例使用一致的 32 px 估算值和行高；行高可变时请使用虚拟滚动器的测量 API。为视口设置有界高度，将内容内边距放在视口内部，并将固定工具栏留在其外部。

树的导航和按键搜索会使用完整的可见模型，包括视口之外的行。应用尚未提供的子项无法参与搜索。行卸载后，树状态仍会保留；如果应用状态需要在折叠或虚拟滚动期间保留，也应放在行组件之外。

## 数据与状态

`items` 是递归的 `TreeNode` 数组，包含 `value`（全局唯一的字符串）、`label`（无障碍名称及按键搜索文本），以及可选的 `children`、`hasChildren`、`busy`、`icon`、`count`、`disabled` 和 `selectable`。重复的 `value` 会被拒绝。

- `v-model` 保存一个已选值，或 `undefined`。父节点关闭时，隐藏的选择仍会保留。
- `v-model:expanded` 保存已展开分支的值。两个模型也都可以不绑定，由组件管理本地状态。
- `activate` 会报告行的默认操作（点击或按 Enter）。按 Space 只会选择。
- 将 `selectWhenFocused` 设为 `true` 可启用随焦点移动而选择；默认值为 `false`。
- 暴露的 `focus(value)` 方法可聚焦可见节点，但不会展开其祖先节点。
- 使用方向键仍可访问禁用节点以查看其内容，但不能激活、选择或切换。禁用分支也会禁用其后代。
- 聚焦节点被隐藏或移除时，焦点会回到最近的可见祖先，然后移至相邻可见节点。空树仍可聚焦。树外的焦点不会因更新而被抢占。

## 键盘与无障碍

为树设置 `aria-label` 或 `aria-labelledby`。组件提供 `tree` 和 `treeitem` 角色、显式的 `aria-level`、`aria-posinset`、`aria-setsize`、展开与选择状态，以及 roving tab stop。层级声明在扁平行上，而非从嵌套组推断。折叠的后代会卸载。即使只挂载部分行，这些属性仍基于数据模型。键盘行为遵循 [WAI-ARIA 树形视图模式](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)。

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

`value` 和 `expanded` 的 ref / getter 是受控数据源；静态值会初始化本地状态。将 `rootAttrs.value` 绑定到树，并将 `getItemAttrs(value)` 绑定到 `visibleItems.value` 中每个可聚焦的行。保留属性中的 `ref` 绑定，以便键盘导航和空树焦点恢复能够移动 DOM 焦点。将行点击绑定到 `focus(value)` 和 `activate(value)`，将分支展开控制点击绑定到 `toggle(value)`；叶节点的占位内容应让点击事件冒泡到行。返回值还会暴露 `value`、`expanded`、`focusedValue`、`visibleItems`、`visibleIndexes`、`entries`、`select` 和 `setExpanded`。请在组件或 effect scope 中创建此组合式函数，使其响应式 watcher 随所属作用域一同释放。

## 布局与样式

紧凑行高为 32 dp；`density="comfortable"` 时为 40 dp。可使用上方公开 token 自定义尺寸和选中颜色。`--md-color-container`、`--md-color-on-container` 和 `--md-state-layer-color` 会保留库中的语义颜色上下文。根布局可向 `TreeView` 或 `TreeItem` 传入 class；内部样式请使用文档说明的 `data-scope` / `data-part` 结构。`row` 是完整宽度的视觉与交互表面；`TreeItem` 根元素表示一个可聚焦节点。

树本身不会创建滚动容器，也不实现虚拟滚动。应由外层面板负责滚动，并将内边距放在滚动区域内部，将固定工具栏放在滚动区域之外。此组件不包含拖放、复选框选择或多选。
