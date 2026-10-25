// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp, h, nextTick, ref, type App } from 'vue';
import TreeView from './TreeView.vue';
import TreeItem from './TreeItem.vue';
import type { TreeNode, UseTreeReturn } from '@/composables/useTree';
import type { TreeItemSlotProps } from './TreeContext';

const apps: App[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  apps.splice(0).forEach((app) => app.unmount());
  document.body.innerHTML = '';
});

function mountTree(extra: Record<string, unknown> = {}) {
  const items = ref<TreeNode[]>([
    {
      value: 'project',
      label: 'Project',
      children: [
        { value: 'alpha', label: 'Alpha' },
        { value: 'alpine', label: 'Alpine' },
        { value: 'disabled', label: 'Disabled', disabled: true },
      ],
    },
    { value: 'settings', label: 'Settings', selectable: false, children: [{ value: 'theme', label: 'Theme' }] },
    { value: 'zulu', label: 'Zulu' },
  ]);
  const value = ref<string>();
  const expanded = ref<string[]>([]);
  const activated: string[] = [];
  let actionCount = 0;
  const host = document.createElement('div');
  document.body.append(host);
  const app = createApp({
    setup: () => () =>
      h(
        TreeView,
        {
          items: items.value,
          modelValue: value.value,
          expanded: expanded.value,
          'onUpdate:modelValue': (next: string | undefined) => {
            value.value = next;
          },
          'onUpdate:expanded': (next: string[]) => {
            expanded.value = next;
          },
          onActivate: (node: TreeNode) => activated.push(node.value),
          'aria-label': 'Files',
          ...extra,
        },
        {
          trailing: ({ item, focused, disabled }: TreeItemSlotProps) =>
            h(
              'button',
              {
                tabindex: focused ? 0 : -1,
                disabled,
                onClick: () => {
                  actionCount++;
                },
              },
              `Pin ${item.label}`,
            ),
        },
      ),
  });
  apps.push(app);
  app.mount(host);
  const node = (label: string) => host.querySelector<HTMLElement>(`[role="treeitem"][aria-label="${label}"]`)!;
  const key = async (label: string, pressed: string, init: KeyboardEventInit = {}) => {
    node(label).dispatchEvent(new KeyboardEvent('keydown', { key: pressed, bubbles: true, cancelable: true, ...init }));
    await nextTick();
  };
  return {
    host,
    node,
    key,
    value,
    expanded,
    items,
    activated,
    get actionCount() {
      return actionCount;
    },
  };
}

describe('TreeView', () => {
  it('navigates every visible level without changing selection or wrapping', async () => {
    const tree = mountTree();
    tree.node('Project').focus();
    await tree.key('Project', 'ArrowRight');
    expect(tree.expanded.value).toEqual(['project']);
    await tree.key('Project', 'ArrowRight');
    expect(document.activeElement).toBe(tree.node('Alpha'));
    await tree.key('Alpha', 'ArrowDown');
    expect(document.activeElement).toBe(tree.node('Alpine'));
    await tree.key('Alpine', 'ArrowUp');
    expect(document.activeElement).toBe(tree.node('Alpha'));
    await tree.key('Alpha', 'ArrowLeft');
    expect(document.activeElement).toBe(tree.node('Project'));
    await tree.key('Project', 'ArrowLeft');
    expect(tree.expanded.value).toEqual([]);
    await tree.key('Project', 'ArrowDown');
    expect(document.activeElement).toBe(tree.node('Settings'));
    await tree.key('Settings', 'End');
    expect(document.activeElement).toBe(tree.node('Zulu'));
    await tree.key('Zulu', 'ArrowDown');
    expect(document.activeElement).toBe(tree.node('Zulu'));
    await tree.key('Zulu', 'Home');
    expect(document.activeElement).toBe(tree.node('Project'));
    expect(tree.value.value).toBeUndefined();
    expect(tree.host.querySelectorAll('[role="treeitem"][tabindex="0"]')).toHaveLength(1);
  });

  it('separates disclosure, selection, activation, and nonselectable categories', async () => {
    const tree = mountTree();
    tree.node('Project').querySelector<HTMLElement>('[data-part="disclosure"]')!.click();
    await nextTick();
    expect(tree.value.value).toBeUndefined();
    expect(tree.activated).toEqual([]);
    tree.node('Alpha').querySelector<HTMLElement>('[data-part="label"]')!.click();
    await nextTick();
    expect(tree.value.value).toBe('alpha');
    expect(tree.activated).toEqual(['alpha']);
    tree.node('Alpine').focus();
    await tree.key('Alpine', ' ');
    expect(tree.value.value).toBe('alpine');
    expect(tree.activated).toEqual(['alpha']);
    await tree.key('Settings', 'Enter');
    expect(tree.expanded.value).toEqual(['project', 'settings']);
    expect(tree.value.value).toBe('alpine');
    expect(tree.node('Settings').hasAttribute('aria-selected')).toBe(false);
    expect(tree.node('Alpha').hasAttribute('aria-expanded')).toBe(false);
  });

  it('supports type-ahead, repeated letters, sibling expansion, RTL, and modifier isolation', async () => {
    const tree = mountTree({ dir: 'rtl' });
    tree.node('Project').focus();
    await tree.key('Project', 'ArrowLeft');
    await tree.key('Project', 'a');
    expect(document.activeElement).toBe(tree.node('Alpha'));
    await tree.key('Alpha', 'a');
    expect(document.activeElement).toBe(tree.node('Alpine'));
    await tree.key('Alpine', 'ArrowRight');
    expect(document.activeElement).toBe(tree.node('Project'));
    await tree.key('Project', '*');
    expect(tree.expanded.value).toEqual(['project', 'settings']);
    await tree.key('Project', 'End', { ctrlKey: true });
    expect(document.activeElement).toBe(tree.node('Project'));
    await tree.key('Project', 'z', { isComposing: true });
    expect(document.activeElement).toBe(tree.node('Project'));
  });

  it('keeps disabled nodes discoverable but blocks their actions', async () => {
    const tree = mountTree();
    tree.expanded.value = ['project'];
    await nextTick();
    tree.node('Alpine').focus();
    await tree.key('Alpine', 'ArrowDown');
    expect(document.activeElement).toBe(tree.node('Disabled'));
    await tree.key('Disabled', 'Enter');
    await tree.key('Disabled', ' ');
    expect(tree.value.value).toBeUndefined();
    expect(tree.activated).toEqual([]);
    expect(tree.node('Disabled').getAttribute('aria-disabled')).toBe('true');
  });

  it('restores actual focus after collapse, removal, and empty data without losing selection', async () => {
    const tree = mountTree();
    tree.expanded.value = ['project'];
    tree.value.value = 'alpha';
    await nextTick();
    tree.node('Alpha').focus();
    tree.expanded.value = [];
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(tree.node('Project'));
    expect(tree.value.value).toBe('alpha');
    tree.items.value = tree.items.value.slice(1);
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(tree.node('Settings'));
    tree.items.value = [];
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(tree.host.querySelector('[role="tree"]'));
    tree.items.value = [{ value: 'new', label: 'New item' }];
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(tree.node('New item'));
  });

  it('does not steal outside focus when data changes', async () => {
    const tree = mountTree();
    tree.node('Project').focus();
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    tree.items.value = [];
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(outside);
  });

  it.each([false, true])('does not steal focus moved outside during removal (empty: %s)', async (empty) => {
    const tree = mountTree();
    tree.node('Project').focus();
    const outside = document.createElement('button');
    document.body.append(outside);
    tree.items.value = empty ? [] : tree.items.value.slice(1);
    await nextTick();
    outside.focus();
    await nextTick();
    expect(document.activeElement).toBe(outside);
  });

  it('does not steal focus moved outside while an empty tree loads', async () => {
    const tree = mountTree();
    tree.items.value = [];
    await nextTick();
    tree.host.querySelector<HTMLElement>('[role="tree"]')!.focus();
    const outside = document.createElement('button');
    document.body.append(outside);
    tree.items.value = [{ value: 'loaded', label: 'Loaded' }];
    await nextTick();
    outside.focus();
    await nextTick();
    expect(document.activeElement).toBe(outside);
  });

  it('invalidates pending recovery when a newer keyboard focus request runs', async () => {
    const onFocusRequest = vi.fn();
    const tree = mountTree({ onFocusRequest });
    tree.node('Project').focus();
    tree.items.value = tree.items.value.slice(1);
    await nextTick();
    await tree.key('Settings', 'End');
    await nextTick();
    expect(document.activeElement).toBe(tree.node('Zulu'));
    expect(onFocusRequest).toHaveBeenCalledExactlyOnceWith('zulu');
  });

  it('offers opt-in selection following focus', async () => {
    const tree = mountTree({ selectWhenFocused: true });
    tree.node('Project').focus();
    await tree.key('Project', 'End');
    expect(tree.value.value).toBe('zulu');
    expect(tree.activated).toEqual([]);
  });

  it('isolates trailing actions and supports F2 and Escape', async () => {
    const tree = mountTree();
    tree.node('Zulu').focus();
    const disabledButton = document.createElement('button');
    disabledButton.disabled = true;
    disabledButton.tabIndex = -1;
    tree.node('Zulu').querySelector('[data-part="trailing"]')!.prepend(disabledButton);
    await tree.key('Zulu', 'F2');
    const button = tree.node('Zulu').querySelector<HTMLButtonElement>('button:not(:disabled)')!;
    expect(document.activeElement).toBe(button);
    button.click();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(button);
    expect(tree.actionCount).toBe(1);
    expect(tree.value.value).toBeUndefined();
    expect(tree.activated).toEqual([]);
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(tree.node('Zulu'));
  });

  it('searches prefixes, resets after a pause, and excludes hidden labels', async () => {
    const tree = mountTree();
    let now = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    tree.node('Project').focus();
    await tree.key('Project', 'a');
    expect(document.activeElement).toBe(tree.node('Project'));
    tree.expanded.value = ['project'];
    await nextTick();
    now += 600;
    await tree.key('Project', 'a');
    await tree.key('Alpha', 'l');
    await tree.key('Alpine', 'p');
    await tree.key('Alpha', 'i');
    expect(document.activeElement).toBe(tree.node('Alpine'));
    now += 600;
    await tree.key('Alpine', 'z');
    expect(document.activeElement).toBe(tree.node('Zulu'));
  });

  it('tracks focus inside actions without selecting and restores it on node removal', async () => {
    const tree = mountTree({ selectWhenFocused: true });
    tree.node('Project').focus();
    tree.node('Zulu').querySelector('button')!.focus();
    await nextTick();
    expect(tree.value.value).toBe('project');
    expect(tree.node('Zulu').tabIndex).toBe(0);
    tree.items.value = tree.items.value.slice(0, -1);
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(tree.node('Settings'));
  });

  it('inherits disabled state through branch descendants', async () => {
    const tree = mountTree();
    tree.items.value[0]!.disabled = true;
    tree.expanded.value = ['project'];
    await nextTick();
    tree.node('Alpha').focus();
    await tree.key('Alpha', 'Enter');
    expect(tree.node('Alpha').getAttribute('aria-disabled')).toBe('true');
    expect(tree.value.value).toBeUndefined();
    expect(tree.activated).toEqual([]);
  });

  it('mounts only expanded rows and declares hierarchy independently of DOM nesting', async () => {
    const tree = mountTree();
    expect(tree.host.querySelectorAll('[role="treeitem"]')).toHaveLength(3);
    tree.expanded.value = ['project'];
    await nextTick();
    expect(tree.host.querySelectorAll('[role="treeitem"]')).toHaveLength(6);
    expect(tree.node('Alpha').parentElement).toBe(tree.node('Project').parentElement);
    expect(tree.node('Alpha').getAttribute('aria-level')).toBe('2');
    expect(tree.node('Alpha').getAttribute('aria-setsize')).toBe('3');
    expect(tree.node('Alpha').getAttribute('aria-posinset')).toBe('1');
    tree.expanded.value = [];
    await nextTick();
    expect(tree.node('Alpha')).toBeNull();
  });

  it('hands focus to externally mounted rows and cancels obsolete or outside focus requests', async () => {
    const rendered = ref('one');
    let controller: UseTreeReturn;
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp({
      setup: () => () =>
        h(
          TreeView,
          {
            items: ['one', 'two', 'three'].map((value) => ({ value, label: value })),
            onFocusRequest: (value: string) => {
              rendered.value = value;
            },
          },
          {
            default: ({ tree }: { tree: UseTreeReturn }) => {
              controller = tree;
              return tree.visibleItems.value
                .filter((entry) => entry.node.value === rendered.value)
                .map((entry) => h(TreeItem, { key: entry.node.value, item: entry.node }));
            },
          },
        ),
    });
    apps.push(app);
    app.mount(host);
    host.querySelector<HTMLElement>('[role="treeitem"]')!.focus();
    controller!.focus('two');
    await nextTick();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('two');
    controller!.focus('one');
    controller!.focus('three');
    await nextTick();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('three');
    const outside = document.createElement('button');
    document.body.append(outside);
    controller!.focus('one');
    outside.focus();
    await nextTick();
    expect(document.activeElement).toBe(outside);
  });
});
