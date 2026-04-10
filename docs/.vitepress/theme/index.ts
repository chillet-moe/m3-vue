import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';

import { initStateLayer, vTooltip } from '@/index';
import Layout from './Layout.vue';

import './style.css';

// 导入组件库样式
import '../../../src/styles/theme.css';
import ApiTable from '../components/ApiTable.vue';
import Controls from '../components/Controls.vue';
import DemoContainer from '../components/DemoContainer.vue';

export default {
  extends: DefaultTheme,
  Layout: () => h(Layout),
  enhanceApp({ app }) {
    // 注册组件库需要的指令和初始化
    app.directive('tooltip', vTooltip);
    initStateLayer();

    app.component('ApiTable', ApiTable);
    app.component('Controls', Controls);
    app.component('DemoContainer', DemoContainer);
  },
} satisfies Theme;
