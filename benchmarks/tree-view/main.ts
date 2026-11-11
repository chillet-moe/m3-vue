import { TreeItem, TreeView, type TreeNode, type UseTreeReturn } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';
import { createApp, h, nextTick, ref, type App } from 'vue';
import type {} from '../componentLifecycle';

const nodes: TreeNode[] = [
  {
    value: 'project',
    label: 'Project',
    children: Array.from({ length: 10_000 }, (_, index) => ({
      value: `file-${index}`,
      label: `File ${index + 1}`,
    })),
  },
  { value: 'archive', label: 'Archive' },
];
const items = new URLSearchParams(location.search).get('variant') === 'reactive' ? ref(nodes).value : nodes;
const host = document.querySelector('main')!;
const expanded = ref<string[]>([]);
let app: App | undefined;

window.componentLifecycleBenchmark = {
  async mount() {
    expanded.value = [];
    app = createApp(() =>
      h(
        TreeView,
        { items, expanded: expanded.value, 'aria-label': 'Project files' },
        {
          default: ({ tree }: { tree: UseTreeReturn }) =>
            tree.visibleItems.value.slice(0, 24).map(({ node }) => h(TreeItem, { key: node.value, item: node })),
        },
      ),
    );
    app.mount(host);
    await nextTick();
  },
  async set(step) {
    expanded.value = step % 2 ? ['project'] : [];
    await nextTick();
  },
  unmount() {
    app!.unmount();
    app = undefined;
  },
  frame: () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
};
