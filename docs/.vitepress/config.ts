import { defineConfig, type DefaultTheme } from 'vitepress';
import { createScopeBoundaryVueOptions } from '@chillet/vue-scope-boundary/vite';
import { fileURLToPath } from 'url';
import { componentMetaPlugin } from './plugins/component-meta.ts';
import { componentAnatomyPlugin } from './plugins/component-anatomy.ts';
import { sourceApiMetaPlugin } from './plugins/source-api-meta.ts';
import { layerPreludePlugin } from './plugins/layer-prelude.ts';

// Sync with theme.css
const m3LayerOrder = ['reset', 'base', 'tokens', 'components'];

const sidebarLabels: Record<string, string> = {
  'Getting Started': '快速开始',
  Installation: '安装',
  Guides: '指南',
  'Multiple windows': '多窗口',
  Styling: '样式定制',
  'Interaction Cursors': '交互光标',
  'Field Layout': '字段布局',
  'Appearance and Layout': '外观与布局',
  'Advanced Integration': '进阶集成',
  'Scrollable Content Visual Overflow': '滚动内容的视觉溢出',
  'Vue Scope Boundaries': 'Vue 作用域边界',
  Composables: '组合式函数',
  'Component Categories': '组件分类',
  Localization: '本地化',
  Components: '组件',
  Infrastructure: '基础设施',
  Actions: '操作',
  Feedback: '反馈',
  Containment: '容器',
  Display: '展示',
  Inputs: '输入',
  Navigation: '导航',
  Selection: '选择',
  Directives: '指令',
  Functions: '函数',
  Utilities: '工具',
  Elevation: '海拔高度',
  'List Grouping': '列表分组',
  'Material Shape Paths': 'Material 形状路径',
  'State Layer': '状态层',
};

function translateSidebar(items: DefaultTheme.SidebarItem[]): DefaultTheme.SidebarItem[] {
  return items.map((item) => ({
    ...item,
    text: item.text ? (sidebarLabels[item.text] ?? item.text) : undefined,
    link: item.link ? `/zh-Hans${item.link}` : undefined,
    items: item.items ? translateSidebar(item.items) : undefined,
  }));
}

const sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Getting Started',
    items: [
      { text: 'Installation', link: '/getting-started' },
      { text: 'Component Categories', link: '/guides/component-categories' },
    ],
  },
  {
    text: 'Appearance and Layout',
    items: [
      { text: 'Styling', link: '/guides/styling' },
      { text: 'Field Layout', link: '/guides/field-layout' },
      { text: 'Interaction Cursors', link: '/guides/interaction-cursors' },
      { text: 'Scrollable Content Visual Overflow', link: '/guides/scrollable-content-visual-overflow' },
    ],
  },
  {
    text: 'Advanced Integration',
    items: [
      { text: 'Localization', link: '/guides/localization' },
      { text: 'Multiple windows', link: '/guides/multiple-windows' },
      { text: 'Vue Scope Boundaries', link: '/guides/vue-scope-isolation' },
      { text: 'Composables', link: '/guides/composables' },
    ],
  },
  {
    text: 'Components',
    items: [
      {
        text: 'Infrastructure',
        items: [{ text: 'OverlayHost', link: '/components/overlay-host' }],
      },
      {
        text: 'Actions',
        items: [
          { text: 'Button', link: '/components/button' },
          { text: 'IconButton', link: '/components/icon-button' },
          { text: 'ButtonGroup', link: '/components/button-group' },
          { text: 'FloatingActionButton', link: '/components/floating-action-button' },
          { text: 'FloatingActionButtonMenu', link: '/components/floating-action-button-menu' },
        ],
      },
      {
        text: 'Feedback',
        items: [
          { text: 'Badge', link: '/components/badge' },
          { text: 'Skeleton', link: '/components/skeleton' },
          { text: 'Snackbar', link: '/components/snackbar' },
          { text: 'Tooltip', link: '/components/tooltip' },
          {
            text: 'ProgressIndicator',
            items: [
              { text: 'CircularProgressIndicator', link: '/components/circular-progress-indicator' },
              { text: 'LinearProgressIndicator', link: '/components/linear-progress-indicator' },
              { text: 'LoadingIndicator', link: '/components/loading-indicator' },
            ],
          },
        ],
      },
      {
        text: 'Containment',
        items: [
          { text: 'Accordion', link: '/components/accordion' },
          { text: 'BottomSheet', link: '/components/bottom-sheet' },
          { text: 'Card', link: '/components/card' },
          { text: 'Dialog', link: '/components/dialog' },
          { text: 'Divider', link: '/components/divider' },
          { text: 'ListItem', link: '/components/item' },
          { text: 'Popover', link: '/components/popover' },
          { text: 'SideSheet', link: '/components/side-sheet' },
        ],
      },
      {
        text: 'Display',
        items: [{ text: 'Icon', link: '/components/icon' }],
      },
      {
        text: 'Inputs',
        items: [
          { text: 'Combobox', link: '/components/combobox' },
          { text: 'DatePicker', link: '/components/date-picker' },
          { text: 'DateRangePicker', link: '/components/date-range-picker' },
          { text: 'InputOtp', link: '/components/input-otp' },
          { text: 'Select', link: '/components/select' },
          { text: 'TextField', link: '/components/text-field' },
          { text: 'TimePicker', link: '/components/time-picker' },
        ],
      },
      {
        text: 'Navigation',
        items: [
          { text: 'Breadcrumb', link: '/components/breadcrumb' },
          { text: 'Menu', link: '/components/menu' },
          { text: 'NavigationDrawer', link: '/components/navigation-drawer' },
          { text: 'NavigationRail', link: '/components/navigation-rail' },
          { text: 'Pagination', link: '/components/pagination' },
          { text: 'Tabs', link: '/components/tabs' },
          { text: 'TreeView', link: '/components/tree-view' },
        ],
      },
      {
        text: 'Selection',
        items: [
          { text: 'CheckBox', link: '/components/checkbox' },
          { text: 'Chip', link: '/components/chip' },
          { text: 'ChipGroup', link: '/components/chip-group' },
          { text: 'Radio', link: '/components/radio' },
          { text: 'Slider', link: '/components/slider' },
          { text: 'Switch', link: '/components/switch' },
        ],
      },
    ],
  },
  {
    text: 'Directives',
    items: [
      { text: 'v-tooltip', link: '/directives/tooltip' },
      { text: 'v-dropdown', link: '/directives/dropdown' },
    ],
  },
  {
    text: 'Functions',
    items: [
      { text: 'showDialog', link: '/functions/show-dialog' },
      { text: 'showSnackbar', link: '/functions/show-snackbar' },
    ],
  },
  {
    text: 'Utilities',
    items: [
      { text: 'Elevation', link: '/utilities/elevation' },
      { text: 'List Grouping', link: '/utilities/list-grouping' },
      { text: 'Material Shape Paths', link: '/utilities/material-shape-paths' },
      { text: 'State Layer', link: '/utilities/state-layer' },
    ],
  },
];

export default defineConfig({
  lang: 'en-US',
  title: 'M3 Vue',
  description: 'Material Design 3 components for Vue',
  locales: {
    root: { label: 'English', lang: 'en-US' },
    'zh-Hans': {
      label: '简体中文',
      lang: 'zh-Hans',
      description: '适用于 Vue 的 Material Design 3 组件',
      themeConfig: {
        nav: [{ text: '文档', link: '/zh-Hans/components/button' }],
        sidebar: { '/zh-Hans/': translateSidebar(sidebar) },
        outline: { label: '本页目录' },
      },
    },
  },
  appearance: true,
  vue: createScopeBoundaryVueOptions(),

  // 构建输出目录（默认就是 .vitepress/dist）
  // 保持默认即可

  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../src', import.meta.url)),
      },
    },
    plugins: [
      layerPreludePlugin({ layers: m3LayerOrder }),
      componentMetaPlugin({
        tsconfigPath: 'tsconfig.docs.json',
        components: ['src/components/**/*.vue'],
      }),
      componentAnatomyPlugin({
        components: 'src/components/**/*.vue',
      }),
      sourceApiMetaPlugin({
        tsconfigPath: 'tsconfig.docs.json',
      }),
    ],
    css: {
      // 复用主项目的 PostCSS 配置
      // VitePress 会自动读取项目根目录的 postcss.config.mts
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    search: {
      provider: 'local',
      options: {
        locales: {
          'zh-Hans': {
            translations: {
              button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
              modal: {
                noResultsText: '没有找到结果',
                resetButtonTitle: '清除搜索',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
              },
            },
          },
        },
      },
    },
    nav: [{ text: 'Docs', link: '/components/button' }],
    sidebar: { '/': sidebar },
    socialLinks: [{ icon: 'github', link: 'https://github.com/chillet-moe/m3-vue' }],
  },
});
