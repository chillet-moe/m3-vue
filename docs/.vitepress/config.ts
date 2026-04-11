import { defineConfig } from 'vitepress';
import { fileURLToPath } from 'url';
import { componentMetaPlugin } from './plugins/component-meta';
import { componentAnatomyPlugin } from './plugins/component-anatomy';

export default defineConfig({
  title: 'M3 Vue',
  description: 'Material Design 3 components for Vue',
  appearance: true,

  // 构建输出目录（默认就是 .vitepress/dist）
  // 保持默认即可

  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../src', import.meta.url)),
      },
    },
    plugins: [
      componentMetaPlugin({
        tsconfigPath: 'tsconfig.docs.json',
        components: ['src/components/**/*.vue'],
      }),
      componentAnatomyPlugin({
        components: 'src/components/**/*.vue',
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
    },
    nav: [
      { text: 'Docs', link: '/components/button' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/getting-started' },
          ],
        },
        {
          text: 'Guides',
          items: [
            { text: 'Styling', link: '/guides/styling' },
          ],
        },
        {
          text: 'Components',
          items: [
            { text: 'Button', link: '/components/button' },
            { text: 'IconButton', link: '/components/icon-button' },
            { text: 'ButtonGroup', link: '/components/button-group' },
            { text: 'Card', link: '/components/card' },
            { text: 'CheckBox', link: '/components/checkbox' },
            { text: 'Chip', link: '/components/chip' },
            { text: 'ChipGroup', link: '/components/chip-group' },
            { text: 'Combobox', link: '/components/combobox' },
            { text: 'Dialog', link: '/components/dialog' },
            { text: 'Icon', link: '/components/icon' },
            { text: 'Menu', link: '/components/menu' },
            { text: 'Radio', link: '/components/radio' },
            { text: 'Select', link: '/components/select' },
            { text: 'Slider', link: '/components/slider' },
            { text: 'Snackbar', link: '/components/snackbar' },
            { text: 'Switch', link: '/components/switch' },
            { text: 'TextField', link: '/components/text-field' },
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
            { text: 'State Layer', link: '/utilities/state-layer' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/chillet-moe/m3-vue' },
    ],
  },
});
