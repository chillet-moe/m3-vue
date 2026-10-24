---
title: Menu
---

<script setup lang="ts">
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

## Color

`color` selects the `standard` or `vibrant` palette. An explicit prop overrides `menuDefaultsContextKey`'s `color`,
with `standard` as the fallback. Set `menuColor` through `M3VuePlugin` for an application default, or provide the
context for a subtree. See [component defaults](/getting-started#component-defaults).

Submenus inherit their parent menu's resolved color unless explicitly overridden. Select and Combobox menus use the
same shared preference, with their `menuColor` prop taking precedence.

## Examples

### Dropdown

<DemoContainer :src="MenuDropdownSrc" :viewport="false">
  <MenuDropdown />
</DemoContainer>

### Context Menu

<DemoContainer :src="MenuContextSrc" :viewport="false">
  <MenuContext />
</DemoContainer>

### Selectable Values

<DemoContainer :src="MenuSelectableSrc" :viewport="false">
  <MenuSelectable />
</DemoContainer>

### Embedded Select

Select options close the Select menu without closing the containing Menu.

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

## Floating surface

See [floating surface tokens](../utilities/elevation.md#floating-surfaces) for shared theme colors, borders, shadows, and an interactive example with nested menus and dialogs.

## Reference

<ApiTable component="Menu" />

<StyleTokenTable component="Menu" />

### Menu

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
