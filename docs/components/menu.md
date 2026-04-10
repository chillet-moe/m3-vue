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
import MenuDeclarative from '../demos/menu/MenuDeclarative.vue';
import MenuDeclarativeSrc from '../demos/menu/MenuDeclarative.vue?raw';
</script>

# Menu

Menu supports dropdown, context, submenu, and object-driven item rendering while keeping keyboard and selection behavior inside the component set.

## Demo

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

### Declarative Items

<DemoContainer :src="MenuDeclarativeSrc" :viewport="false">
  <MenuDeclarative />
</DemoContainer>

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
