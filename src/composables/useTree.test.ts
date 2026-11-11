import { describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref, shallowRef } from 'vue';
import { useTree, type TreeNode } from './useTree';

const items: TreeNode[] = [
  {
    value: 'root',
    label: 'Root',
    children: [
      { value: 'child', label: 'Child' },
      { value: 'disabled', label: 'Disabled', disabled: true },
    ],
  },
  { value: 'group', label: 'Group', selectable: false, children: [{ value: 'leaf', label: 'Leaf' }] },
];

describe('useTree', () => {
  it('keeps expansion, selection, and focus independent', () => {
    const scope = effectScope();
    const tree = scope.run(() => useTree({ items, expanded: ['root'], value: 'child' }))!;
    expect(tree.visibleItems.value.map((entry) => entry.node.value)).toEqual(['root', 'child', 'disabled', 'group']);
    tree.focus('disabled');
    expect(tree.value.value).toBe('child');
    tree.select('disabled');
    expect(tree.value.value).toBe('child');
    tree.toggle('root');
    expect(tree.value.value).toBe('child');
    expect(tree.focusedValue.value).toBe('root');
    tree.activate('group');
    expect(tree.expanded.value).toEqual(['group']);
    expect(tree.value.value).toBe('child');
    scope.stop();
  });

  it('treats refs/getters as controlled sources without optimistic duplicate state', () => {
    const value = ref<string>();
    const expanded = ref<string[]>([]);
    const onValueChange = vi.fn();
    const onExpandedChange = vi.fn();
    const scope = effectScope();
    const tree = scope.run(() =>
      useTree({ items, value, expanded: () => expanded.value, onValueChange, onExpandedChange }),
    )!;
    tree.select('child');
    tree.toggle('root');
    expect(onValueChange).toHaveBeenCalledWith('child');
    expect(onExpandedChange).toHaveBeenCalledWith(['root']);
    expect(tree.value.value).toBeUndefined();
    expect(tree.expanded.value).toEqual([]);
    value.value = 'child';
    expanded.value = ['root'];
    expect(tree.value.value).toBe('child');
    expect(tree.visibleItems.value).toHaveLength(4);
    scope.stop();
  });

  it('normalizes expansion and omits branch and selection semantics where inapplicable', () => {
    const scope = effectScope();
    const tree = scope.run(() => useTree({ items }))!;
    tree.setExpanded(['child', 'root', 'root', 'missing']);
    expect(tree.expanded.value).toEqual(['root']);
    expect(tree.getItemAttrs('child')['aria-expanded']).toBeUndefined();
    expect(tree.getItemAttrs('group')['aria-selected']).toBeUndefined();
    expect(tree.getItemAttrs('child')).toMatchObject({ 'aria-level': 2, 'aria-posinset': 1, 'aria-setsize': 2 });
    scope.stop();
  });

  it('rejects duplicate node values', () => {
    const scope = effectScope();
    expect(() => scope.run(() => useTree({ items: [...items, items[0]!] }))).toThrow('Duplicate tree value: root');
    scope.stop();
  });

  it('restores focus to the parent when a reactive node key changes', async () => {
    const child = ref<TreeNode>({ value: 'child', label: 'Child' });
    const items: TreeNode[] = [
      { value: 'first', label: 'First' },
      { value: 'parent', label: 'Parent', children: [child.value] },
    ];
    const scope = effectScope();
    try {
      const tree = scope.run(() => useTree({ items, expanded: ['parent'] }))!;
      tree.focus('child');
      expect(tree.focusedValue.value).toBe('child');

      child.value.value = 'renamed';
      await nextTick();
      expect(tree.focusedValue.value).toBe('parent');
      expect(tree.visibleIndexes.value.get('renamed')).toBe(2);
      expect(tree.entries.value.has('child')).toBe(false);
      tree.select('renamed');
      expect(tree.value.value).toBe('renamed');
      expect(tree.getItemAttrs('renamed').tabindex).toBe(-1);
    } finally {
      scope.stop();
    }
  });

  it('rebuilds node keys when a shallow items ref is replaced', async () => {
    const nodes = shallowRef<TreeNode[]>([
      { value: 'root', label: 'Root', children: [{ value: 'child', label: 'Child' }] },
    ]);
    const scope = effectScope();
    try {
      const tree = scope.run(() => useTree({ items: () => nodes.value, expanded: ['root'] }))!;
      tree.focus('child');
      nodes.value = [{ value: 'root', label: 'Root', children: [{ value: 'replacement', label: 'Replacement' }] }];
      await nextTick();

      expect(tree.focusedValue.value).toBe('root');
      expect([...tree.visibleIndexes.value.keys()]).toEqual(['root', 'replacement']);
      tree.select('replacement');
      expect(tree.value.value).toBe('replacement');
      tree.focus('replacement');
      expect(tree.getItemAttrs('replacement')).toMatchObject({ tabindex: 0, 'aria-selected': true, 'aria-level': 2 });
    } finally {
      scope.stop();
    }
  });

  it('represents unloaded branches without taking ownership of loading or cached data', async () => {
    const nodes = ref<TreeNode[]>([{ value: 'remote', label: 'Remote', hasChildren: true }]);
    const scope = effectScope();
    const tree = scope.run(() => useTree({ items: nodes }))!;
    expect(tree.getItemAttrs('remote')['aria-expanded']).toBe(false);
    tree.toggle('remote');
    expect(tree.expanded.value).toEqual(['remote']);
    nodes.value[0]!.busy = true;
    expect(tree.getItemAttrs('remote')['aria-busy']).toBe(true);
    nodes.value[0]!.children = [{ value: 'loaded', label: 'Loaded' }];
    nodes.value[0]!.busy = false;
    expect(tree.visibleItems.value.map((entry) => entry.node.value)).toEqual(['remote', 'loaded']);
    expect(tree.visibleIndexes.value.get('loaded')).toBe(1);
    tree.select('loaded');
    tree.toggle('remote');
    expect(tree.visibleItems.value).toHaveLength(1);
    expect(tree.entries.value.has('loaded')).toBe(true);
    expect(tree.value.value).toBe('loaded');
    tree.toggle('remote');
    expect(tree.visibleItems.value).toHaveLength(2);
    scope.stop();
  });
});
