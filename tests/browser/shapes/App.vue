<script setup lang="ts">
import { ref } from 'vue';
import {
  provideShape,
  CheckBox,
  type M3Shape,
  Button,
  IconButton,
  ButtonGroup,
  ButtonGroupItem,
  TextField,
  Select,
  Combobox,
  InputOtp,
  Card,
  Chip,
  FloatingActionButton,
  FloatingActionButtonMenu,
  FloatingActionButtonMenuItem,
  Menu,
  MenuItem,
  MenuContainer,
  TreeView,
  TreeItem,
  ListItem,
  NavigationDrawer,
  NavigationDrawerItem,
  NavigationDrawerSection,
  NavigationRail,
  NavigationRailItem,
  Popover,
  Dialog,
  Snackbar,
  BottomSheet,
  SideSheet,
  DatePicker,
  DateRangePicker,
  TimePicker,
} from '@/index';
const shape = ref<M3Shape>('rounded');
provideShape(shape);
const options = [{ value: 'one', label: 'One' }];
const items = [{ value: 'node', label: 'Node' }];
</script>
<template>
  <main>
    <select v-model="shape" aria-label="Shape">
      <option v-for="mode in ['rounded', 'square', 'minimal', 'sharp']" :key="mode">{{ mode }}</option>
    </select>
    <div class="probes">
      <Button data-testid="button">Action</Button>
      <Button data-testid="fixed" :press-shape-morph="false">Fixed</Button>
      <Button data-testid="local" shape="rounded">Local</Button>
      <Button data-testid="token" style="--md-button-container-shape: 7px">Token</Button>
      <IconButton data-testid="icon" icon="edit" aria-label="Edit" />
      <Button data-testid="toggle" toggleable><input type="checkbox" checked />Toggle</Button>
      <IconButton data-testid="icon-toggle" toggleable icon="favorite"><input type="checkbox" checked /></IconButton>
      <ButtonGroup data-testid="group" type="connected" model-value="b"
        ><ButtonGroupItem value="a">A</ButtonGroupItem><ButtonGroupItem value="b">B</ButtonGroupItem
        ><ButtonGroupItem value="c">C</ButtonGroupItem></ButtonGroup
      >
      <ButtonGroup data-testid="group-fixed" type="connected" :press-shape-morph="false" model-value="b">
        <ButtonGroupItem value="a">Fixed A</ButtonGroupItem><ButtonGroupItem value="b">Fixed B</ButtonGroupItem
        ><ButtonGroupItem value="c">Fixed C</ButtonGroupItem>
      </ButtonGroup>
      <div data-testid="field">
        <ButtonGroup data-testid="group-token" type="connected" style="--md-button-group-connected-container-shape: 7px"
          ><ButtonGroupItem value="x">Token group</ButtonGroupItem></ButtonGroup
        ><TextField label="Field" model-value="" />
      </div>
      <Select data-testid="select" label="Select" :options="options" />
      <Combobox label="Combobox" :options="options" />
      <InputOtp data-testid="otp" />
      <CheckBox data-testid="checkbox" :checked="true" /><Card data-testid="card">Card</Card
      ><Chip data-testid="chip">Chip</Chip><FloatingActionButton data-testid="fab" icon="add" />
      <FloatingActionButtonMenu icon="add"
        ><FloatingActionButtonMenuItem data-testid="fab-menu-item">FAB item</FloatingActionButtonMenuItem
        ><FloatingActionButtonMenuItem data-testid="fab-menu-local" shape="rounded"
          >Local item</FloatingActionButtonMenuItem
        ></FloatingActionButtonMenu
      ><ListItem data-testid="list" title="List" active /><ListItem
        data-testid="expressive"
        title="Expressive"
        appearance="expressive"
        active
      /><ListItem data-testid="static-list" title="Static" :interactive="false" />
      <TreeView :items="items" data-testid="tree" />
      <TreeView :items="items" data-testid="local-tree"><TreeItem :item="items[0]!" shape="rounded" /></TreeView>
      <NavigationDrawer
        ><NavigationDrawerItem data-testid="drawer" label="Drawer" selected /><NavigationDrawerSection
          data-testid="section"
          label="Section"
      /></NavigationDrawer>
      <NavigationRail state="expanded"
        ><NavigationRailItem data-testid="rail" label="Rail" icon="home" selected
      /></NavigationRail>
      <Menu data-testid="menu"
        ><MenuContainer><MenuItem data-testid="menu-item">Menu row</MenuItem></MenuContainer></Menu
      >
      <Popover data-testid="popover">Popover</Popover><Dialog data-testid="dialog">Dialog</Dialog
      ><Snackbar data-testid="snackbar">Snackbar</Snackbar><BottomSheet data-testid="bottom">Bottom</BottomSheet
      ><SideSheet data-testid="side">Side</SideSheet> <DatePicker data-testid="date" /><DateRangePicker
        data-testid="range"
      /><TimePicker data-testid="time" />
    </div>
  </main>
</template>
<style scoped>
.probes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  padding: 2rem;
}
</style>
