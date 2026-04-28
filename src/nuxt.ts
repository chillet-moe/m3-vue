import { addComponent, addImports, addPluginTemplate, defineNuxtModule } from '@nuxt/kit';
import { m3VueComponentNames } from './resolver';

const PACKAGE_NAME = '@chillet/m3-vue';
const STYLE_PATH = `${PACKAGE_NAME}/style.css`;
const DEFAULT_PLUGIN_FILENAME = 'm3-vue.plugin.mjs';

export interface M3VueNuxtOptions {
  components?: boolean;
  css?: boolean;
  directives?: boolean;
  imports?: boolean;
  prefix?: string;
}

export default defineNuxtModule<M3VueNuxtOptions>({
  meta: {
    name: '@chillet/m3-vue/nuxt',
    configKey: 'm3Vue',
  },
  defaults: {
    components: true,
    css: true,
    directives: true,
    imports: false,
    prefix: '',
  },
  setup(options: M3VueNuxtOptions, nuxt: { options: { css: string[] } }) {
    const prefix = options.prefix ?? '';

    if (options.css && !nuxt.options.css.includes(STYLE_PATH)) {
      nuxt.options.css.push(STYLE_PATH);
    }

    if (options.components) {
      for (const componentName of m3VueComponentNames) {
        addComponent({
          name: `${prefix}${componentName}`,
          export: componentName,
          filePath: PACKAGE_NAME,
        });
      }
    }

    if (options.imports) {
      for (const name of ['usePressedState', 'usePressShapeMorph']) {
        addImports({
          name,
          from: PACKAGE_NAME,
        });
      }
    }

    if (options.directives) {
      addPluginTemplate({
        filename: DEFAULT_PLUGIN_FILENAME,
        getContents: () =>
          `
import { defineNuxtPlugin } from '#app/nuxt';
import { M3VuePlugin } from '${PACKAGE_NAME}';

export default defineNuxtPlugin({
  name: 'm3-vue',
  setup(nuxtApp) {
    nuxtApp.vueApp.use(M3VuePlugin);
  },
});
`.trimStart(),
      });
    }
  },
});
