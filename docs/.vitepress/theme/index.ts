import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';

import { M3VuePlugin } from '@/index';
import Layout from './Layout.vue';

import './style.css';

// 导入组件库样式
import '../../../src/styles/theme.css';
import ApiTable from '../components/ApiTable.vue';
import Controls from '../components/Controls.vue';
import DemoContainer from '../components/DemoContainer.vue';
import AnatomyTable from '../components/AnatomyTable.vue';
import SourceApiTable from '../components/SourceApiTable.vue';
import StyleTokenTable from '../components/StyleTokenTable.vue';

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout),
  enhanceApp({ app }) {
    app.use(M3VuePlugin);
    app.component('ApiTable', ApiTable);
    app.component('Controls', Controls);
    app.component('DemoContainer', DemoContainer);
    app.component('AnatomyTable', AnatomyTable);
    app.component('SourceApiTable', SourceApiTable);
    app.component('StyleTokenTable', StyleTokenTable);
  },
} satisfies Theme;
