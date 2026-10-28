<script setup lang="ts">
import { ref } from 'vue';
import {
  provideRowSize,
  type RowSize,
  Button,
  Menu,
  vDropdown,
  ButtonGroup,
  IconButton,
  TextField,
  Select,
  Combobox,
  ListItem,
  TreeView,
  Chip,
  Tabs,
  TabList,
  Tab,
  Dialog,
  Snackbar,
  DatePicker,
  DateRangePicker,
  TimePicker,
  Icon,
  InputOtp,
  Breadcrumb,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  NavigationDrawer,
  NavigationDrawerItem,
  NavigationDrawerSection,
  NavigationRail,
  NavigationRailItem,
} from '@/index';
const rowSize = ref<RowSize>('medium');
provideRowSize(rowSize);
const open = ref(false);
const menu = ref<{ menuRef?: HTMLDivElement } | null>(null);
const menuItems = [
  { label: 'Command', leadingIcon: 'edit' },
  { label: 'Large command', size: 'large' as const },
  { label: 'Details', supportingText: 'Supporting text remains readable' },
  { type: 'submenu' as const, label: 'More commands', items: [{ label: 'Nested command' }] },
];
const sizes = ['extra-small', 'small', 'medium', 'large', 'extra-large'] as const;
const options = [
  { value: 'one', label: '常规 General' },
  { value: 'two', label: '高级 Advanced' },
];
</script>

<template>
  <main class="workspace">
    <h1>组件密度 · Component density</h1>
    <select v-model="rowSize" data-testid="row-size" aria-label="Row size">
      <option v-for="size in sizes" :key="size" :value="size">{{ size }}</option>
    </select>
    <div class="controls">
      <Button data-testid="button" leading-icon="add">添加 Add</Button>
      <IconButton data-testid="icon" icon="settings" aria-label="Settings" />
      <Chip data-testid="chip">已启用 Enabled</Chip>
    </div>
    <ButtonGroup data-testid="group" type="connected"
      ><Button><input type="radio" value="first" />First</Button
      ><Button><input type="radio" value="second" />Second</Button></ButtonGroup
    >
    <div data-testid="field"><TextField label="名称 Name" model-value="示例 Sample" /></div>
    <section class="field-icon-probes">
      <div v-for="size in ['extra-small', 'small', 'medium'] as const" :key="size" :data-field-size="size">
        <TextField :size="size" label="Icons" model-value="Value">
          <template #leading><Icon name="search" /></template>
          <template #trailing><Icon name="info" /></template>
        </TextField>
        <TextField :size="size" label="Action" model-value="Value">
          <template #trailing><IconButton icon="close" aria-label="Clear value" /></template>
        </TextField>
        <TextField :size="size" label="Date" type="date" model-value="" />
        <Select :size="size" label="Select" :options="options" />
        <Combobox :size="size" label="Combobox" :options="options" />
      </div>
    </section>
    <Button v-dropdown="menu?.menuRef">Open menu</Button>
    <Menu ref="menu" :items="menuItems" />
    <Select label="分类 Category" :options="options" />
    <Combobox label="搜索 Search" :options="options" />
    <ListItem data-testid="item" title="常规 General" leading-icon="settings" />
    <ListItem
      data-testid="multiline"
      title="多行内容 Multiline"
      description="Long content remains readable as density changes. 较长的文字应保持完整显示，并随内容增高。"
    />
    <TreeView :items="[{ value: 'one', label: '文件 Files' }]" aria-label="Files" />
    <Tabs model-value="one"
      ><TabList><Tab value="one">设置 Settings</Tab><Tab value="two">属性 Properties</Tab></TabList></Tabs
    >
    <div class="audit-probes">
      <InputOtp
        v-for="size in ['small', 'medium', 'large'] as const"
        :key="size"
        :size="size"
        :data-testid="`otp-${size}`"
        aria-label="Code"
      />
      <Breadcrumb data-testid="breadcrumb" :items="[{ label: 'Home', href: '#' }, { label: 'Settings' }]" />
      <Pagination data-testid="pagination"
        ><PaginationContent>
          <PaginationItem><PaginationLink>1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationEllipsis /></PaginationItem> </PaginationContent
      ></Pagination>
      <NavigationDrawer aria-label="Density drawer">
        <NavigationDrawerItem data-testid="drawer-item" value="one" icon="home" label="Home" />
        <NavigationDrawerSection data-testid="drawer-section" label="Projects" icon="folder" />
      </NavigationDrawer>
      <NavigationRail
        v-for="state in ['collapsed', 'expanded'] as const"
        :key="state"
        :state="state"
        :aria-label="state"
      >
        <NavigationRailItem :data-testid="`rail-${state}`" value="one" icon="home" label="Home" />
      </NavigationRail>
    </div>
    <div class="comfortable"><Button data-testid="reset">默认密度 Default density</Button></div>
    <DatePicker today="2026-10-27" /><DateRangePicker today="2026-10-27" /><TimePicker />
    <Snackbar action-label="Undo">已保存 Saved</Snackbar>
    <Button @click="open = true">Open dialog</Button>
    <Dialog v-model:open="open"
      ><template #headline>确认 Confirm</template><TextField label="Dialog field" model-value="" /><template #actions
        ><Button @click="open = false">Close dialog</Button></template
      ></Dialog
    >
  </main>
  <section class="size-probes" style="--md-density: -99">
    <div v-for="size in sizes" :key="size" :data-size-probe="size">
      <ButtonGroup :size="size" type="connected"
        ><Button variant="outlined" leading-icon="add">Action</Button></ButtonGroup
      >
      <IconButton :size="size" icon="add" aria-label="Add" />
    </div>
    <Tabs variant="line" size="extra-small" model-value="one"
      ><TabList
        ><Tab value="one"
          ><template #icon><Icon name="settings" /></template>Settings</Tab
        ></TabList
      ></Tabs
    >
  </section>
</template>

<style>
body {
  margin: 0;
  font-family: sans-serif;
}
.workspace {
  max-inline-size: 480px;
  margin: 24px auto;
  padding: 24px;
  display: grid;
  gap: 24px;
}
.audit-probes {
  min-inline-size: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
}
h1 {
  font-size: 20px;
}
.controls {
  display: flex;
  align-items: center;
  gap: 16px;
}
.comfortable {
  --md-density: 0;
}
</style>
