import { defineSetupVue3 } from '@histoire/plugin-vue';
import WrapperGlobal from './WrapperGlobal.vue';

export const setupVue3 = defineSetupVue3(({ addWrapper }) => {
  addWrapper(WrapperGlobal);
});
