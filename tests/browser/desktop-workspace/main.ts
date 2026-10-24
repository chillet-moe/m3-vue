import '@/styles/theme.css';
import { createApp } from 'vue';
import DesktopWorkspace from './Panel.vue';
import { M3VuePlugin } from '@/index';
import '@/styles/tokens.css';
const app = createApp(DesktopWorkspace);
app.use(M3VuePlugin);
app.mount('#app');
document.body.style.cssText = 'margin:24px;background:var(--md-sys-color-surface);color:var(--md-sys-color-on-surface)';
