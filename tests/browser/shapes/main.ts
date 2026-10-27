import '@/styles/themes/default.css';
import { createApp } from 'vue';
import { M3VuePlugin } from '@/index';
import App from './App.vue';
createApp(App).use(M3VuePlugin).mount('#app');
