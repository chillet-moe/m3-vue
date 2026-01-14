import { HstVue } from '@histoire/plugin-vue';
import { defaultColors, defineConfig } from 'histoire';

export default defineConfig({
  theme: {
    title: 'M3 - Vue',
    logo: {
      square: '/public/logo.svg',
      light: '/public/logo.svg',
      dark: '/public/logo.svg',
    },
    colors: {
      primary: defaultColors.teal,
    },
  },
  setupFile: {
    browser: 'histoire/histoire.setup.ts',
    server: 'histoire/histoire.setup.server.ts',
  },
  storyMatch: ['histoire/**/*.story.vue'],
  tree: {
    file: 'title',
    order: 'asc',
    groups: [
      {
        title: 'Components',
        include: (file) => file.path.includes('/components/'),
      },
    ],
  },
  plugins: [HstVue()],
});
