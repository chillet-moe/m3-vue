---
title: TreeView
---

<script setup lang="ts">
import { ref } from 'vue';
import TreeViewDefault from '../demos/tree-view/TreeViewDefault.vue';
import TreeViewDefaultSrc from '../demos/tree-view/TreeViewDefault.vue?raw';
import TreeViewSettings from '../demos/tree-view/TreeViewSettings.vue';
import TreeViewSettingsSrc from '../demos/tree-view/TreeViewSettings.vue?raw';
const props = ref({});
</script>

# TreeView

A compact single-select tree for project files and settings categories. Expansion, selection, and keyboard focus are independent. `TreeView` renders the data recursively with `TreeItem`; `useTree` provides the same behavior for custom markup.

<DemoContainer><TreeViewDefault v-bind="props" /></DemoContainer>

<AnatomyTable scope="tree-view" />

<AnatomyTable scope="tree-item" />

<ApiTable component="TreeView" v-model="props" :exclude="['items', 'modelValue', 'expanded', 'dir']" />

<ApiTable component="TreeItem" :exclude="['item']" />

<StyleTokenTable component="TreeView" />

## Examples

### Project files and actions

<DemoContainer :src="TreeViewDefaultSrc"><TreeViewDefault /></DemoContainer>

Use the `leading`, `label`, and `trailing` slots to customize every level. They receive `{ item, selected, expanded, focused, disabled }`. Keep labels and leading content noninteractive. Place buttons in `trailing`, give them accessible names, bind `disabled`, and use `:tabindex="focused ? 0 : -1"` so actions on other rows do not enter the tab order. Actions do not select or expand the row. Counts are visual; include their meaning in `label` when needed for accessibility.

### Settings categories

<DemoContainer :src="TreeViewSettingsSrc"><TreeViewSettings /></DemoContainer>

Set `selectable: false` for grouping categories. Clicking or pressing Enter on a category toggles it without changing the selected setting. The default slot can render `TreeItem` explicitly; pass the same nodes and order as `items`. Each `TreeItem` renders its children and forwards its slots recursively.

## Data and state

`items` is a recursive array of `TreeNode`: `value` (globally unique string), `label` (accessible name and type-ahead text), optional `children`, `icon`, `count`, `disabled`, and `selectable`. Empty children are treated as a leaf. Duplicate values are rejected.

- `v-model` holds one selected value, or `undefined`. Hidden selection is retained when a parent closes.
- `v-model:expanded` holds expanded branch values. Both models also work without binding for local state.
- `activate` reports a row's default action (click or Enter). Space selects without activation.
- `selectWhenFocused` opts into selection following focus; the default is `false`.
- The exposed `focus(value)` method focuses a visible node without opening its ancestors.
- Disabled nodes remain reachable by arrow keys for discovery, but cannot activate, select, or toggle. A disabled branch also disables its descendants.
- When a focused node is hidden or removed, focus returns to its nearest visible ancestor, then a neighboring visible node. An empty tree remains focusable. Updates do not steal focus from outside the tree.

## Keyboard and accessibility

Give the tree an `aria-label` or `aria-labelledby`. The components provide `tree`, `treeitem`, and `group` roles, levels, sibling positions, expansion and selection state, and a roving tab stop. Branch children are hidden when collapsed. The behavior follows the [WAI-ARIA tree view pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/).

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

Refs/getters for `value` and `expanded` are controlled sources; static values initialize local state. Bind `rootAttrs.value` to the tree, `getItemAttrs(value)` to each focusable node, and `getGroupAttrs(value)` to nested child groups. Keep the item attribute `ref` binding so keyboard navigation can move DOM focus. Bind row clicks to `focus(value)` and `activate(value)` and disclosure clicks to `toggle(value)`. The return value also exposes `value`, `expanded`, `focusedValue`, `visibleItems`, `entries`, `select`, and `setExpanded`. Create the composable inside a component or effect scope so its reactive watcher is disposed with its owner.

## Layout and styling

Compact rows are 32 dp; `density="comfortable"` uses 40 dp. Customize dimensions and selected colors with the public tokens above. `--md-color-container`, `--md-color-on-container`, and `--md-state-layer-color` preserve the library's semantic color context. For root layout, pass a class to `TreeView` or `TreeItem`; for internal styling use the documented `data-scope` / `data-part` anatomy. `row` is the full-width visual and interaction surface; `root` owns the node and its nested `group`.

The tree does not create a scroll container. Let the containing panel own scrolling, with its padding inside the scrolling region and fixed toolbars outside it. Drag and drop, checkbox selection, multiselect, and virtual scrolling are not included.
