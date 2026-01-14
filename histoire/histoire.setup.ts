import { defineSetupVue3 } from '@histoire/plugin-vue';

import '@/styles/theme.css';
import '@/components/StateLayer/state-layer';
import './styles.css';
import WrapperGlobal from './WrapperGlobal.vue';

export const setupVue3 = defineSetupVue3(({ addWrapper }) => {
  addWrapper(WrapperGlobal);
});
