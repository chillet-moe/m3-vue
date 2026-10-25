import { createApp } from 'vue';
import { M3VuePlugin } from '@/index';
import App from './App.vue';

if (new URLSearchParams(location.search).has('compact')) {
  await import('@/styles/typography-compact.css');
}
createApp(App).use(M3VuePlugin).mount('#app');
