<script setup lang="ts">
import { computed, ref } from 'vue';
import { useData } from 'vitepress';
import { vDropdown } from '@/directives/Menu';
import {
  Button,
  IconButton,
  Icon,
  Chip,
  ListItem,
  Menu,
  MenuContainer,
  MenuItem,
  TextField,
  Select,
  TreeView,
  NavigationDrawer,
  NavigationDrawerItem,
  NavigationRail,
  NavigationRailItem,
  Switch,
} from '@/index';
const { lang } = useData();
const zh = computed(() => lang.value === 'zh-Hans');
const icon = ref('settings');
const menu = ref<InstanceType<typeof Menu>>();
const guides = ref(true);
const sizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
const densities = [0, -2, -4, 2];
const options = ['settings', 'search', 'add', 'favorite', 'arrow_forward'].map((value) => ({ value, label: value }));
</script>

<template>
  <div class="icon-lab vp-raw" :class="{ 'icon-lab-guides': guides }">
    <div class="icon-lab-controls">
      <Select v-model="icon" label="Icon" :options="options" />
      <Switch v-model:checked="guides">{{ zh ? '显示图标布局边界' : 'Show icon layout bounds' }}</Switch>
    </div>
    <h2>{{ zh ? '当前设置' : 'Current settings' }}</h2>
    <div class="icon-lab-current">
      <Button :leading-icon="icon" variant="outlined">Export 导出</Button>
      <IconButton :icon="icon" aria-label="Settings" variant="outlined" />
      <Chip :leading-icon="icon">Chip</Chip>
      <TextField label="TextField" model-value="Example"
        ><template #leading><Icon :name="icon" /></template
      ></TextField>
      <Select label="Select" :options="options" :model-value="icon" />
    </div>
    <ListItem :leading-icon="icon">ListItem</ListItem>
    <Button leading-icon="menu" v-dropdown="menu?.menuRef ?? null">Menu</Button
    ><Menu ref="menu"
      ><MenuContainer
        ><MenuItem
          ><template #leading><Icon :name="icon" /></template>MenuItem<template #trailing
            ><Icon name="chevron_right" /></template></MenuItem></MenuContainer
    ></Menu>
    <TreeView
      :items="[
        { value: 'root', label: 'TreeView', icon, children: [{ value: 'child', label: 'Child', icon: 'description' }] },
      ]"
    />
    <NavigationDrawer><NavigationDrawerItem value="icons" :icon="icon" label="NavigationDrawer" /></NavigationDrawer>
    <NavigationRail><NavigationRailItem value="icons" :icon="icon" label="Rail" /></NavigationRail>
    <h2>{{ zh ? '尺寸与密度' : 'Size and density' }}</h2>
    <div class="icon-lab-scroll">
      <table class="icon-lab-table">
        <thead>
          <tr>
            <th>size</th>
            <th v-for="density in densities" :key="density">density {{ density }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="size in sizes" :key="size">
            <th>{{ size }}</th>
            <td v-for="density in densities" :key="density" :style="{ '--md-density': density }">
              <Button :size="size" :leading-icon="icon" variant="outlined">Export</Button>
              <IconButton :size="size" :icon="icon" aria-label="Settings" variant="outlined" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <h2>{{ zh ? '图标来源与显式尺寸' : 'Icon sources and explicit sizes' }}</h2>
    <div class="icon-lab-current">
      <Button leading-icon="add" variant="outlined">Material Symbols</Button>
      <Button variant="outlined"
        ><template #leading
          ><Icon :content-ratio="1"
            ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1v22M1 12h22" /></svg></Icon></template
        >SVG · 1</Button
      >
      <Button variant="outlined"
        ><template #leading
          ><Icon :content-ratio="0.6666667"
            ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" /></svg></Icon></template
        >SVG · ⅔</Button
      >
      <Icon :name="icon" size="32px" :content-ratio="5 / 6" />
      <span>size="32px"</span>
    </div>
    <div class="icon-lab-inline">
      <p v-for="fontSize in [14, 20, 32]" :key="fontSize" :style="{ fontSize: `${fontSize}px` }">
        <Icon :name="icon" variant="inline" /> Export 导出 · 1em
      </p>
    </div>
  </div>
</template>

<style scoped>
.icon-lab {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  min-inline-size: 0;
}
.icon-lab-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--md-field-column-gap);
}
.icon-lab-current {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--md-field-row-gap) var(--md-field-column-gap);
}
.icon-lab-scroll {
  overflow: auto;
}
.icon-lab-table {
  display: table;
  margin: 0;
  border-collapse: collapse;
}
.icon-lab-table th,
.icon-lab-table td {
  padding: 12px;
  border: 1px solid var(--md-sys-color-outline-variant);
  white-space: nowrap;
}
.icon-lab-table td > * + * {
  margin-inline-start: 12px;
}
.icon-lab-guides :deep([data-part='glyph']) {
  outline: 1px dashed var(--md-sys-color-primary);
}
.icon-lab-inline {
  overflow: auto;
}
.icon-lab-inline p {
  white-space: nowrap;
}
</style>
