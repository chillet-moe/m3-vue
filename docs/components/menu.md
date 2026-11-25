---
title: Menu
---

<script setup lang="ts">
import MenuCheckbox from '../demos/menu/MenuCheckbox.vue';
import MenuCheckboxSrc from '../demos/menu/MenuCheckbox.vue?raw';
import MenuDropdown from '../demos/menu/MenuDropdown.vue';
import MenuDropdownSrc from '../demos/menu/MenuDropdown.vue?raw';
import MenuContext from '../demos/menu/MenuContext.vue';
import MenuContextSrc from '../demos/menu/MenuContext.vue?raw';
import MenuSelectable from '../demos/menu/MenuSelectable.vue';
import MenuSelectableSrc from '../demos/menu/MenuSelectable.vue?raw';
import MenuWithSelect from '../demos/menu/MenuWithSelect.vue';
import MenuWithSelectSrc from '../demos/menu/MenuWithSelect.vue?raw';
import MenuDeclarative from '../demos/menu/MenuDeclarative.vue';
import MenuDeclarativeSrc from '../demos/menu/MenuDeclarative.vue?raw';
import MenuLinks from '../demos/menu/MenuLinks.vue';
import MenuLinksSrc from '../demos/menu/MenuLinks.vue?raw';
</script>

# Menu

Menu supports dropdown, context, submenu, and object-driven item rendering while keeping keyboard and selection behavior inside the component set.

## Basic menu

### Dropdown and submenus

A `MenuItem` with `submenu` displays a trailing arrow. In the `MenuSubMenu` trigger slot, bind `:submenu-open="open"` to expose the expanded state. Use `#trailing` to replace the arrow, or `trailingIcon` on a declarative submenu.

<DemoContainer :src="MenuDropdownSrc" :viewport="false">
  <MenuDropdown />
</DemoContainer>

### Context Menu

<DemoContainer :src="MenuContextSrc" :viewport="false">
  <MenuContext />
</DemoContainer>

## Selection

### Single and multiple values

Bind `Menu v-model` and give each selectable `MenuItem` a unique `value`. A single value selects one row; with `multiple`, the model is an array. Menu derives each row's `checked` state and its `menuitemradio` or `menuitemcheckbox` role. Do not also maintain a per-row checked model or toggle the value in a click handler.

Set `:close-on-select="false"` to keep the menu open for repeated selections.

<DemoContainer :src="MenuSelectableSrc" :viewport="false">
  <MenuSelectable />
</DemoContainer>

### Consumer-owned state

For an option backed by an existing boolean, omit `value`: set `role="menuitemcheckbox"`, bind `checked`, and update the state in the row's click handler. For a consumer-owned single-choice group, use `role="menuitemradio"`, derive each row's `checked` from the shared value, and assign that value on activation.

<DemoContainer :src="MenuCheckboxSrc" :viewport="false">
  <MenuCheckbox />
</DemoContainer>

### Interaction and presentation

`MenuItem` displays a leading radio for `menuitemradio` and a checkbox for `menuitemcheckbox`, whether the role is inferred from the menu model or set explicitly. The indicator reflects the row's `checked` and `disabled` states. The row itself receives focus and handles activation. Use `selected` for row emphasis.

To replace the indicator, provide `#leading` or set `leadingIcon` on a declarative item. The slot receives the resolved `checked` and `disabled` states. For example, this row uses a check mark for the active sort order:

```vue
<MenuItem value="name" label="Name">
  <template #leading="{ checked }">
    <Icon v-if="checked" name="check" aria-hidden="true" />
  </template>
</MenuItem>
```

Up/Down move between enabled rows. Enter or Space activates the focused row; a checkbox toggles, while a radio selects its value. Escape closes the menu. Submenus use Right to enter and Left to return.

Presentation CheckBox and Radio reserve only their visible box or circle. Their standalone target-size tokens do not add space inside the menu.

## Other compositions

### Custom item content

Use `#leading` and `#trailing` for icons or small graphics such as color swatches. For a shortcut or current value on the same line as the label, use `#trailingText`. It uses the menu's text styling and can appear alongside the default submenu arrow. Use `#badge` for a count and `#supporting` for a description on a second line.

```vue
<MenuItem label="Save">
  <template #trailingText>Ctrl+S</template>
</MenuItem>
```

### Embedded Select

Place an independently focusable control such as `Select` inside `MenuContainer`, as a sibling of the menu items. Choosing an option closes the Select dropdown and keeps the containing Menu open.

<DemoContainer :src="MenuWithSelectSrc" :viewport="false">
  <MenuWithSelect />
</DemoContainer>

### Declarative Items

<DemoContainer :src="MenuDeclarativeSrc" :viewport="false">
  <MenuDeclarative />
</DemoContainer>

### Links

Render the `MenuItem` itself as the interactive link. Do not nest `<a>` inside `MenuItem`, because that creates invalid interactive markup.

<DemoContainer :src="MenuLinksSrc" :viewport="false">
  <MenuLinks />
</DemoContainer>

If you are using Vue Router, keep `MenuItem` as the rendered anchor and let `RouterLink` provide the navigation state through its `custom` slot:

```vue
<RouterLink custom to="/settings" v-slot="{ href, navigate }">
  <MenuItem :href="href" @click="navigate">
    Settings
  </MenuItem>
</RouterLink>
```

## Appearance

### Row sizes

Set `size` on Menu for all rows, on MenuItem for one row, or on MenuSubMenu for a branch. Declarative item and submenu entries also accept `size`. Select/Combobox menus inherit the shared row size independently of their field size.

Row height is a minimum. At default density, a medium row is at least 3rem tall, including 0.75rem of padding above and below the content. Size a custom image to 1.5rem tall or less to keep it within that single-line space. Taller content expands the row.

See [Row sizes](../guides/styling#row-sizes) for the scale, shared `rowSize` default and density behavior.

### Color

`color` selects the `standard` or `vibrant` palette. An explicit prop overrides `menuDefaultsContextKey`'s `color`,
with `standard` as the fallback. Set `menuColor` through `M3VuePlugin` for an application default, or provide the
context for a subtree. See [component defaults](/getting-started#component-defaults).

Submenus inherit their parent menu's resolved color unless explicitly overridden. Select and Combobox menus use the
same shared preference, with their `menuColor` prop taking precedence.

### Density

Menu rows inherit `--md-density`, including nested menus and Select/Combobox options. Each step adjusts vertical
whitespace by 4dp; top and bottom padding stop at 4dp each. Labels, icons and multiline content retain their size.
Set `--md-density: 0` on a menu to keep its default spacing. Explicit `--md-menus-menu-item-height`,
`--md-menus-menu-item-top-space` and `--md-menus-menu-item-bottom-space` values override the corresponding density rules.

### Floating surface

See [floating surface tokens](../utilities/elevation.md#floating-surfaces) for shared theme colors, borders, shadows, and an interactive example with nested menus and dialogs.

## Reference

### Menu

<ApiTable component="Menu" />

<StyleTokenTable component="Menu" />

`update:open(false)` reflects the native popover closing immediately. Use `closed` for cleanup that must wait until the
Menu-owned opacity and scale exit finishes. Animations inside slotted menu content are not included.

`Menu.show(focusFirst = false, source?)` can also be called while the Menu is open. A new `source` updates its CSS
anchor while keeping the Menu open; this does not emit `update:open(false)` or `closed`, and closes any submenus. The
same or omitted `source` keeps the current anchor. Each call with `focusFirst: true` explicitly requests focus on the
first item; `false` preserves focus. After the Menu closes, a later call without `source` does not reuse the previous
explicit source.

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
