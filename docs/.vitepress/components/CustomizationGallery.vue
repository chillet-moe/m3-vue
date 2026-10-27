<script setup lang="ts">
import { ref } from 'vue';
import { useData, withBase } from 'vitepress';
import { Tabs, TabList, Tab, TabPanel } from '@/index';
import ButtonDefault from '../../demos/button/ButtonDefault.vue';
import IconButtonDefault from '../../demos/icon-button/IconButtonDefault.vue';
import ButtonGroupDefault from '../../demos/button-group/ButtonGroupDefault.vue';
import ChipDefault from '../../demos/chip/ChipDefault.vue';
import ChipGroupDefault from '../../demos/chip-group/ChipGroupDefault.vue';
import FloatingActionButtonDefault from '../../demos/floating-action-button/FloatingActionButtonDefault.vue';
import FloatingActionButtonMenuDefault from '../../demos/floating-action-button-menu/FloatingActionButtonMenuDefault.vue';
import TextFieldDefault from '../../demos/text-field/TextFieldDefault.vue';
import SelectDefault from '../../demos/select/SelectDefault.vue';
import ComboboxDefault from '../../demos/combobox/ComboboxDefault.vue';
import InputOtpDefault from '../../demos/input-otp/InputOtpDefault.vue';
import SliderDefault from '../../demos/slider/SliderDefault.vue';
import CheckBoxDefault from '../../demos/checkbox/CheckBoxDefault.vue';
import RadioDefault from '../../demos/radio/RadioDefault.vue';
import SwitchDefault from '../../demos/switch/SwitchDefault.vue';
import DatePickerDefault from '../../demos/date-picker/DatePickerDefault.vue';
import DateRangePickerDefault from '../../demos/date-range-picker/DateRangePickerDefault.vue';
import TimePickerDefault from '../../demos/time-picker/TimePickerDefault.vue';
import CardDefault from '../../demos/card/CardDefault.vue';
import AccordionDefault from '../../demos/accordion/AccordionDefault.vue';
import ItemDefault from '../../demos/item/ItemDefault.vue';
import TreeViewDefault from '../../demos/tree-view/TreeViewDefault.vue';
import DividerDefault from '../../demos/divider/DividerDefault.vue';
import TabsDefault from '../../demos/tabs/TabsDefault.vue';
import BreadcrumbDefault from '../../demos/breadcrumb/BreadcrumbDefault.vue';
import PaginationDefault from '../../demos/pagination/PaginationDefault.vue';
import NavigationRailDefault from '../../demos/navigation-rail/NavigationRailDefault.vue';
import NavigationDrawerDefault from '../../demos/navigation-drawer/NavigationDrawerDefault.vue';
import BadgeDefault from '../../demos/badge/BadgeDefault.vue';
import LinearProgressIndicatorDefault from '../../demos/linear-progress-indicator/LinearProgressIndicatorDefault.vue';
import CircularProgressIndicatorDefault from '../../demos/circular-progress-indicator/CircularProgressIndicatorDefault.vue';
import LoadingIndicatorDefault from '../../demos/loading-indicator/LoadingIndicatorDefault.vue';
import SkeletonDefault from '../../demos/skeleton/SkeletonDefault.vue';
import SnackbarDefault from '../../demos/snackbar/SnackbarDefault.vue';
import TooltipDefault from '../../demos/tooltip/TooltipDefault.vue';
import MenuDeclarative from '../../demos/menu/MenuDeclarative.vue';
import DialogDefault from '../../demos/dialog/DialogDefault.vue';
import PopoverDefault from '../../demos/popover/PopoverDefault.vue';
import BottomSheetDefault from '../../demos/bottom-sheet/BottomSheetDefault.vue';
import SideSheetDefault from '../../demos/side-sheet/SideSheetDefault.vue';

const { lang } = useData();
const category = ref('actions');
const labels = {
  en: {
    actions: 'Actions',
    inputs: 'Inputs',
    content: 'Content',
    navigation: 'Navigation',
    feedback: 'Feedback',
    overlays: 'Overlays',
    gallery: 'Component previews',
  },
  zh: {
    actions: '操作',
    inputs: '输入',
    content: '内容',
    navigation: '导航',
    feedback: '反馈',
    overlays: '浮层',
    gallery: '组件预览',
  },
};
const groups = [
  {
    id: 'actions' as const,
    components: [
      { name: 'Button', path: '/components/button', demo: ButtonDefault },
      { name: 'IconButton', path: '/components/icon-button', demo: IconButtonDefault },
      { name: 'ButtonGroup', path: '/components/button-group', demo: ButtonGroupDefault },
      { name: 'Chip', path: '/components/chip', demo: ChipDefault },
      { name: 'ChipGroup', path: '/components/chip-group', demo: ChipGroupDefault },
      { name: 'FloatingActionButton', path: '/components/floating-action-button', demo: FloatingActionButtonDefault },
      {
        name: 'FloatingActionButtonMenu',
        path: '/components/floating-action-button-menu',
        demo: FloatingActionButtonMenuDefault,
      },
    ],
  },
  {
    id: 'inputs' as const,
    components: [
      { name: 'TextField', path: '/components/text-field', demo: TextFieldDefault },
      { name: 'Select', path: '/components/select', demo: SelectDefault },
      { name: 'Combobox', path: '/components/combobox', demo: ComboboxDefault },
      { name: 'InputOtp', path: '/components/input-otp', demo: InputOtpDefault },
      { name: 'Slider', path: '/components/slider', demo: SliderDefault },
      { name: 'CheckBox', path: '/components/checkbox', demo: CheckBoxDefault },
      { name: 'Radio', path: '/components/radio', demo: RadioDefault },
      { name: 'Switch', path: '/components/switch', demo: SwitchDefault },
      { name: 'DatePicker', path: '/components/date-picker', demo: DatePickerDefault },
      { name: 'DateRangePicker', path: '/components/date-range-picker', demo: DateRangePickerDefault },
      { name: 'TimePicker', path: '/components/time-picker', demo: TimePickerDefault },
    ],
  },
  {
    id: 'content' as const,
    components: [
      { name: 'Card', path: '/components/card', demo: CardDefault },
      { name: 'Accordion', path: '/components/accordion', demo: AccordionDefault },
      { name: 'ListItem', path: '/components/item', demo: ItemDefault },
      { name: 'TreeView', path: '/components/tree-view', demo: TreeViewDefault },
      { name: 'Divider', path: '/components/divider', demo: DividerDefault },
    ],
  },
  {
    id: 'navigation' as const,
    components: [
      { name: 'Tabs', path: '/components/tabs', demo: TabsDefault },
      { name: 'Breadcrumb', path: '/components/breadcrumb', demo: BreadcrumbDefault },
      { name: 'Pagination', path: '/components/pagination', demo: PaginationDefault },
      { name: 'NavigationRail', path: '/components/navigation-rail', demo: NavigationRailDefault },
      { name: 'NavigationDrawer', path: '/components/navigation-drawer', demo: NavigationDrawerDefault },
    ],
  },
  {
    id: 'feedback' as const,
    components: [
      { name: 'Badge', path: '/components/badge', demo: BadgeDefault },
      {
        name: 'LinearProgressIndicator',
        path: '/components/linear-progress-indicator',
        demo: LinearProgressIndicatorDefault,
      },
      {
        name: 'CircularProgressIndicator',
        path: '/components/circular-progress-indicator',
        demo: CircularProgressIndicatorDefault,
      },
      { name: 'LoadingIndicator', path: '/components/loading-indicator', demo: LoadingIndicatorDefault },
      { name: 'Skeleton', path: '/components/skeleton', demo: SkeletonDefault },
      { name: 'Snackbar', path: '/components/snackbar', demo: SnackbarDefault },
      { name: 'Tooltip', path: '/components/tooltip', demo: TooltipDefault },
    ],
  },
  {
    id: 'overlays' as const,
    components: [
      { name: 'Menu', path: '/components/menu', demo: MenuDeclarative },
      { name: 'Dialog', path: '/components/dialog', demo: DialogDefault },
      { name: 'Popover', path: '/components/popover', demo: PopoverDefault },
      { name: 'BottomSheet', path: '/components/bottom-sheet', demo: BottomSheetDefault },
      { name: 'SideSheet', path: '/components/side-sheet', demo: SideSheetDefault },
    ],
  },
];
</script>

<template>
  <Tabs v-model="category" variant="line" size="small" class="customization-gallery vp-raw">
    <TabList :aria-label="labels[lang === 'zh-Hans' ? 'zh' : 'en'].gallery">
      <Tab v-for="group in groups" :key="group.id" :value="group.id">{{
        labels[lang === 'zh-Hans' ? 'zh' : 'en'][group.id]
      }}</Tab>
    </TabList>
    <TabPanel v-for="group in groups" :key="group.id" :value="group.id">
      <div v-if="category === group.id" class="gallery-grid">
        <section v-for="item in group.components" :key="item.name" class="gallery-item" :aria-label="item.name">
          <h3 class="gallery-heading">
            <a :href="withBase(`${lang === 'zh-Hans' ? '/zh-Hans' : ''}${item.path}`)">{{ item.name }}</a>
          </h3>
          <div class="gallery-sample"><component :is="item.demo" /></div>
        </section>
      </div>
    </TabPanel>
  </Tabs>
</template>

<style scoped>
.customization-gallery {
  margin-block: 1.5rem;
  min-inline-size: 0;
}
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: 1rem;
  padding-block: 1rem;
}
.gallery-item {
  min-inline-size: 0;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-shape-card);
}
.gallery-heading {
  margin: 0;
  padding: 1rem 1rem 0;
  font: inherit;
  font-weight: 500;
}
.gallery-sample {
  overflow-x: auto;
  padding: 1rem;
}
</style>
