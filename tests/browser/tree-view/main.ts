import { createApp, h } from 'vue';
import '@/index';
import TreeViewDefault from '../../../docs/demos/tree-view/TreeViewDefault.vue';
import TreeViewSettings from '../../../docs/demos/tree-view/TreeViewSettings.vue';
import TreeViewVirtual from '../../../docs/demos/tree-view/TreeViewVirtual.vue';
import TreeViewAsync from '../../../docs/demos/tree-view/TreeViewAsync.vue';

createApp({
  render: () =>
    h('main', { style: { padding: '16px', width: '420px' } }, [
      h('button', { id: 'before' }, 'Before'),
      h(TreeViewDefault),
      h(TreeViewSettings),
      h(TreeViewVirtual),
      h(TreeViewAsync),
      h('button', { id: 'after' }, 'After'),
    ]),
}).mount('#app');
