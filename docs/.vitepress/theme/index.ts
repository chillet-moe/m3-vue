import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';

import { initStateLayer, vTooltip } from '@/index';

import './style.css';

// 导入组件库样式
import '../../../src/styles/theme.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册组件库需要的指令和初始化
    app.directive('tooltip', vTooltip);
    initStateLayer();
  },
} satisfies Theme;
