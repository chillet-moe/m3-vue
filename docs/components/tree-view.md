---
title: TreeView
---

<script setup lang="ts">
import { ref } from 'vue';
import TreeViewDefault from '../demos/tree-view/TreeViewDefault.vue';
import TreeViewDefaultSrc from '../demos/tree-view/TreeViewDefault.vue?raw';
import TreeViewSettings from '../demos/tree-view/TreeViewSettings.vue';
import TreeViewSettingsSrc from '../demos/tree-view/TreeViewSettings.vue?raw';
import TreeViewAsync from '../demos/tree-view/TreeViewAsync.vue';
import TreeViewAsyncSrc from '../demos/tree-view/TreeViewAsync.vue?raw';
import TreeViewVirtual from '../demos/tree-view/TreeViewVirtual.vue';
import TreeViewVirtualSrc from '../demos/tree-view/TreeViewVirtual.vue?raw';
const props = ref({});
</script>

# TreeView

A compact single-select tree for project files and settings categories. Expansion, selection, and keyboard focus are independent. `useTree` derives an ordered list of visible nodes; `TreeView` renders that list with `TreeItem`. The data and interaction state remain independent of mounted rows.

<DemoContainer><TreeViewDefault v-bind="props" /></DemoContainer>

<AnatomyTable scope="tree-view" />

<AnatomyTable scope="tree-item" />

<ApiTable component="TreeView" v-model="props" :exclude="['items', 'modelValue', 'expanded', 'dir']" />

<ApiTable component="TreeItem" :exclude="['item']" />

<StyleTokenTable component="TreeView" />

## Row sizes

Set `size` on TreeView for its rows. Custom row rendering can set `size` on individual TreeItem components; flattened rows do not inherit the size of their logical parent node.

See [Row sizes](../guides/styling#row-sizes) for the scale, shared `rowSize` default and density behavior.

## Examples

### Project files and actions

<DemoContainer :src="TreeViewDefaultSrc"><TreeViewDefault /></DemoContainer>

Use the `leading`, `label`, and `trailing` slots to customize every row. They receive `{ item, selected, expanded, focused, disabled, branch, busy }`. Keep labels and leading content noninteractive. Place buttons in `trailing`, give them accessible names, bind `disabled`, and use `:tabindex="focused ? 0 : -1"` so actions on other rows do not enter the tab order. Actions do not select or expand the row. Counts are visual; include their meaning in `label` when needed for accessibility.

### Settings categories

<DemoContainer :src="TreeViewSettingsSrc"><TreeViewSettings /></DemoContainer>

Set `selectable: false` for grouping categories. Clicking or pressing Enter on a category toggles it without changing the selected setting. The default slot receives `{ tree }` and can render `tree.visibleItems.value` explicitly. Each `TreeItem` renders exactly one row; it does not recursively mount children. Use node values as keys and preserve the visible list's order.

### Asynchronous children

<DemoContainer :src="TreeViewAsyncSrc"><TreeViewAsync /></DemoContainer>

Set `hasChildren: true` when a branch can be expanded before its children are loaded. Set `busy: true` while loading to expose `aria-busy`. Populate `children` when data arrives. Nonempty children also establish a branch; otherwise `hasChildren` defaults to false. For an empty result, the caller can retain a directory as an expandable branch or set `hasChildren: false` to make it a leaf.

The application owns requests, caches, cancellation, and errors. Observe the expanded model to start loading; use slots for progress and retry controls. The example cancels pending requests on collapse/unmount and retains successfully loaded children for subsequent expansion. It also restores row focus before replacing a retry button with a progress indicator. Production loaders should discard obsolete responses when their source changes. The tree never starts requests or creates a second copy of loaded children.

### External virtualization

<DemoContainer :src="TreeViewVirtualSrc"><TreeViewVirtual /></DemoContainer>

<<< @/demos/tree-view/TreeVirtualRows.vue

This example uses the application's TanStack Virtual instance to render 10,000 files. TanStack is only a documentation/example dependency; the component library neither imports it nor owns the scroll container.

The integration has three responsibilities:

- Render a window of `tree.visibleItems.value`, keyed by `entry.node.value`. `tree.visibleIndexes.value` maps values to row indexes.
- Handle `focusRequest(value)` by scrolling the corresponding index into view. This synchronous notification runs before the library focuses the row; a missing row is focused after Vue's next render. A headless consumer uses `onFocusRequest` instead. Keep the focused index in TanStack's `rangeExtractor` so manual scrolling does not unmount the active row or its trailing controls.
- Own row measurements and the scrolling viewport. The example uses matching 32 px estimates and row heights; use the virtualizer's measurement APIs for variable-height rows. Give the viewport a bounded height, put content padding inside it, and leave fixed toolbars outside it.

The tree's navigation and type-ahead use the entire visible model, including rows outside the viewport. Unloaded children are not searchable until the application supplies them. Tree state survives row unmounts; application state must also live outside row components if it needs to survive collapse or virtualization.

## Data and state

`items` is a recursive array of `TreeNode`: `value` (globally unique string), `label` (accessible name and type-ahead text), optional `children`, `hasChildren`, `busy`, `icon`, `count`, `disabled`, and `selectable`. Duplicate values are rejected.

- `v-model` holds one selected value, or `undefined`. Hidden selection is retained when a parent closes.
- `v-model:expanded` holds expanded branch values. Both models also work without binding for local state.
- `activate` reports a row's default action (click or Enter). Space selects without activation.
- `selectWhenFocused` opts into selection following focus; the default is `false`.
- The exposed `focus(value)` method focuses a visible node without opening its ancestors.
- Disabled nodes remain reachable by arrow keys for discovery, but cannot activate, select, or toggle. A disabled branch also disables its descendants.
- When a focused node is hidden or removed, focus returns to its nearest visible ancestor, then a neighboring visible node. An empty tree remains focusable. Updates do not steal focus from outside the tree.

## Keyboard and accessibility

Give the tree an `aria-label` or `aria-labelledby`. The components provide `tree` and `treeitem` roles, explicit `aria-level`, `aria-posinset`, `aria-setsize`, expansion and selection state, and a roving tab stop. Hierarchy is declared on flat rows rather than inferred from nested groups. Collapsed descendants are unmounted. These attributes remain based on the data model when only a window of rows is mounted. Keyboard behavior follows the [WAI-ARIA tree view pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/).

| Key                        | Behavior                                                            |
| -------------------------- | ------------------------------------------------------------------- |
| Up / Down                  | Previous / next visible node, without wrapping                      |
| Right                      | Expand a branch, then move to its first child                       |
| Left                       | Collapse a branch, or move to its parent                            |
| Home / End                 | First / last visible node                                           |
| Enter                      | Select and activate; toggle a nonselectable category                |
| Space                      | Select without activation                                           |
| Characters                 | Find a visible label by prefix; repeated characters cycle matches   |
| `*`                        | Expand enabled sibling branches                                     |
| Tab / Shift+Tab            | Normal document order, including the focused row's trailing actions |
| F2                         | Focus the first enabled trailing action                             |
| Escape in trailing actions | Return focus to the row                                             |

Left and Right are mirrored in RTL. Pass `dir` or inherit the document direction. Typing starts a new prefix after 500 ms. Editable controls and nested action key events are not handled as tree navigation.

## Headless use

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

Refs/getters for `value` and `expanded` are controlled sources; static values initialize local state. Bind `rootAttrs.value` to the tree and `getItemAttrs(value)` to each focusable row from `visibleItems.value`. Keep the attribute `ref` bindings so keyboard navigation and empty-tree recovery can move DOM focus. Bind row clicks to `focus(value)` and `activate(value)` and branch disclosure clicks to `toggle(value)`; leaf spacers must bubble to the row. The return value also exposes `value`, `expanded`, `focusedValue`, `visibleItems`, `visibleIndexes`, `entries`, `select`, and `setExpanded`. Create the composable inside a component or effect scope so its reactive watcher is disposed with its owner.

## Layout and styling

Rows are 48dp by default. Set `--md-density: -2` for 40dp or `--md-density: -4` for 32dp; the old `density` prop has been removed. See [Density](../guides/styling#density). Customize dimensions and selected colors with the public tokens above. `--md-color-container`, `--md-color-on-container`, and `--md-state-layer-color` preserve the library's semantic color context. For root layout, pass a class to `TreeView` or `TreeItem`; for internal styling use the documented `data-scope` / `data-part` anatomy. `row` is the full-width visual and interaction surface; the `TreeItem` root represents one focusable node.

The tree does not create a scroll container or implement a virtualizer. Let the containing panel own scrolling, with its padding inside the scrolling region and fixed toolbars outside it. Drag and drop, checkbox selection, and multiselect are not included.
