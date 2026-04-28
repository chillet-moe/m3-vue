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

## Composable

### useMenu

<SourceApiTable api="useMenu" />

## API

### Menu

<ApiTable component="Menu" />

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
