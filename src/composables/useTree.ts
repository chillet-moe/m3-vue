import { computed, isRef, nextTick, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { isHTMLElement } from '@/internal/elementEnvironment';

export type TreeNode = {
  value: string;
  label: string;
  children?: readonly TreeNode[];
  hasChildren?: boolean;
  busy?: boolean;
  disabled?: boolean;
  selectable?: boolean;
  icon?: string;
  count?: string | number;
};

export type TreeEntry = {
  node: TreeNode;
  parent: string | undefined;
  level: number;
  position: number;
  size: number;
  disabled: boolean;
  branch: boolean;
};

type TreeItemActivity = {
  focused: boolean;
  selected: boolean;
  expanded: boolean;
};

export type UseTreeOptions = {
  items: MaybeRefOrGetter<readonly TreeNode[]>;
  value?: MaybeRefOrGetter<string | undefined>;
  expanded?: MaybeRefOrGetter<readonly string[]>;
  onValueChange?: (value: string | undefined) => void;
  onExpandedChange?: (values: string[]) => void;
  onActivate?: (node: TreeNode) => void;
  onFocusRequest?: (value: string) => void;
  selectWhenFocused?: MaybeRefOrGetter<boolean>;
  dir?: MaybeRefOrGetter<'ltr' | 'rtl' | undefined>;
};

export function useTree(options: UseTreeOptions) {
  const controlledValue = isRef(options.value) || typeof options.value === 'function';
  const controlledExpanded = isRef(options.expanded) || typeof options.expanded === 'function';
  const localValue = ref(toValue(options.value));
  const localExpanded = ref<readonly string[]>(toValue(options.expanded) ?? []);
  const value = computed(() => (controlledValue ? toValue(options.value) : localValue.value));
  const expanded = computed(() => (controlledExpanded ? toValue(options.expanded) : localExpanded.value) ?? []);
  const expandedSet = computed(() => new Set(expanded.value));
  const elements = new Map<string, HTMLElement>();
  let rootElement: HTMLElement | undefined;
  const focused = ref<string>();
  let focusRequest = 0;
  let search = '';
  let lastTyped = 0;

  const entries = computed(() => {
    const items = toValue(options.items);
    const result = new Map<string, TreeEntry>();
    const visit = (nodes: readonly TreeNode[], parent: string | undefined, level: number, parentDisabled: boolean) => {
      const size = nodes.length;
      nodes.forEach((node, index) => {
        const key = node.value;
        if (result.has(key)) throw new Error(`Duplicate tree value: ${key}`);

        const children = node.children;
        const hasChildren = !!children?.length;
        const disabled = !!node.disabled || parentDisabled;
        const branch = node.hasChildren === true || hasChildren;
        result.set(key, { node, parent, level, position: index + 1, size, disabled, branch });
        if (hasChildren) visit(children, key, level + 1, disabled);
      });
    };
    visit(items, undefined, 1, false);
    return result;
  });

  const visibleTree = computed(() => {
    const items: TreeEntry[] = [];
    const indexes = new Map<string, number>();
    const allEntries = entries.value;
    allEntries.forEach((entry, key) => {
      if (entry.parent !== undefined && (!indexes.has(entry.parent) || !expandedSet.value.has(entry.parent))) return;
      indexes.set(key, items.length);
      items.push(entry);
    });
    return { items, indexes, allEntries };
  });
  const visibleItems = computed(() => visibleTree.value.items);
  const visibleIndexes = computed(() => visibleTree.value.indexes);
  const focusedValue = computed(() => {
    const visible = visibleItems.value;
    let candidate = focused.value ?? value.value;
    while (candidate !== undefined) {
      if (visibleIndexes.value.has(candidate)) return candidate;
      candidate = entries.value.get(candidate)?.parent;
    }
    return visible[0]?.node.value;
  });

  function select(next: string | undefined) {
    if (next !== undefined) {
      const entry = entries.value.get(next);
      if (!entry || entry.disabled || entry.node.selectable === false) return;
    }
    if (next === value.value) return;
    if (!controlledValue) localValue.value = next;
    options.onValueChange?.(next);
  }

  function setExpanded(values: readonly string[]) {
    const next = [...new Set(values)].filter((key) => entries.value.get(key)?.branch);
    if (next.length === expanded.value.length && next.every((key) => expandedSet.value.has(key))) return;
    if (!controlledExpanded) localExpanded.value = next;
    options.onExpandedChange?.(next);
  }

  function toggle(key: string) {
    const entry = entries.value.get(key);
    if (!entry?.branch || entry.disabled) return;
    setExpanded(
      expandedSet.value.has(key) ? expanded.value.filter((value) => value !== key) : [...expanded.value, key],
    );
  }

  function beginFocusRequest() {
    const request = ++focusRequest;
    const document = rootElement?.ownerDocument;
    const activeElement = document?.activeElement;
    return () => {
      if (request !== focusRequest) return false;
      if (!document || document.activeElement === activeElement) return true;
      return !!activeElement && !activeElement.isConnected && document.activeElement === document.body;
    };
  }

  function restoreFocus() {
    const isCurrentRequest = beginFocusRequest();
    void nextTick(() => {
      if (!isCurrentRequest()) return;
      if (focusedValue.value !== undefined) focus(focusedValue.value);
      else rootElement?.focus();
    });
  }

  function focus(key: string) {
    if (!visibleIndexes.value.has(key)) return;
    const isCurrentRequest = beginFocusRequest();
    focused.value = key;
    options.onFocusRequest?.(key);
    if (!isCurrentRequest()) return;
    const element = elements.get(key);
    if (element) {
      element.focus();
      return;
    }
    void nextTick(() => {
      if (!isCurrentRequest() || focusedValue.value !== key) return;
      elements.get(key)?.focus();
    });
  }

  function activate(key: string) {
    const entry = entries.value.get(key);
    if (!entry || entry.disabled) return;
    const node = entry.node;
    if (node.selectable === false) toggle(key);
    else select(key);
    options.onActivate?.(node);
  }

  watch(visibleTree, (current, previous) => {
    if (
      !previous.items.length &&
      current.items.length &&
      rootElement &&
      rootElement === rootElement.ownerDocument.activeElement
    ) {
      restoreFocus();
    }
    const oldKey = focused.value;
    if (oldKey === undefined || current.indexes.has(oldKey)) return;
    const element = elements.get(oldKey);
    const hadFocus = element?.contains(element.ownerDocument.activeElement);
    // Use the previous index snapshot; its nodes may already have new reactive keys.
    const oldIndex = previous.indexes.get(oldKey) ?? 0;
    let ancestor = previous.allEntries.get(oldKey)?.parent;
    while (ancestor !== undefined && !current.indexes.has(ancestor)) {
      ancestor = previous.allEntries.get(ancestor)?.parent;
    }
    focused.value = ancestor ?? current.items[Math.min(oldIndex, current.items.length - 1)]?.node.value;
    if (hadFocus) restoreFocus();
  });

  function onKeydown(key: string, event: KeyboardEvent) {
    if (
      event.target !== event.currentTarget ||
      event.defaultPrevented ||
      event.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const entry = entries.value.get(key);
    if (!entry) return;
    const visible = visibleItems.value;
    const index = visibleIndexes.value.get(key) ?? -1;
    let next: string | undefined;
    switch (event.key) {
      case 'ArrowDown':
        next = visible[index + 1]?.node.value;
        break;
      case 'ArrowUp':
        next = visible[index - 1]?.node.value;
        break;
      case 'Home':
        next = visible[0]?.node.value;
        break;
      case 'End':
        next = visible.at(-1)?.node.value;
        break;
      case 'ArrowLeft':
      case 'ArrowRight': {
        const element = elements.get(key);
        const direction =
          toValue(options.dir) ??
          (element ? element.ownerDocument.defaultView?.getComputedStyle(element).direction : 'ltr');
        const opens = event.key === (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
        if (opens) {
          if (entry.disabled) break;
          if (!expandedSet.value.has(key)) toggle(key);
          else next = entry.node.children?.[0]?.value;
        } else if (expandedSet.value.has(key) && entry.branch) {
          toggle(key);
        } else {
          next = entry.parent;
        }
        break;
      }
      case '*':
        setExpanded([
          ...expanded.value,
          ...visible
            .filter((item) => item.parent === entry.parent && !item.disabled && item.branch)
            .map((item) => item.node.value),
        ]);
        break;
      case 'Enter':
        activate(key);
        break;
      case ' ':
        select(key);
        break;
      default: {
        if (event.key.length !== 1 || event.key === ' ') return;
        const now = Date.now();
        search = now - lastTyped > 500 ? event.key : search + event.key;
        lastTyped = now;
        const query = [...search].every((character) => character === search[0]) ? search[0]! : search;
        const normalizedQuery = query.toLocaleLowerCase();
        for (let offset = 1; offset <= visible.length; offset++) {
          const item = visible[(index + offset) % visible.length]!;
          if (item.node.label.trim().toLocaleLowerCase().startsWith(normalizedQuery)) {
            next = item.node.value;
            break;
          }
        }
      }
    }
    event.preventDefault();
    if (next !== undefined) focus(next);
  }

  function buildItemAttrs(key: string, activity?: TreeItemActivity) {
    const entry = entries.value.get(key);
    return {
      role: 'treeitem',
      tabindex: (activity?.focused ?? focusedValue.value === key) ? 0 : -1,
      'aria-label': entry?.node.label,
      'aria-level': entry?.level,
      'aria-posinset': entry?.position,
      'aria-setsize': entry?.size,
      'aria-expanded': entry?.branch ? (activity?.expanded ?? expandedSet.value.has(key)) : undefined,
      'aria-busy': entry?.node.busy || undefined,
      'aria-selected': entry?.node.selectable === false ? undefined : (activity?.selected ?? value.value === key),
      'aria-disabled': entry?.disabled || undefined,
      ref: (element: unknown) => {
        if (isHTMLElement(element)) elements.set(key, element);
        else elements.delete(key);
      },
      onFocusin: (event: FocusEvent) => {
        if (!isHTMLElement(event.target) || event.target.closest('[role="treeitem"]') !== event.currentTarget) return;
        focusRequest++;
        focused.value = key;
        if (event.target === event.currentTarget && toValue(options.selectWhenFocused)) select(key);
      },
      onKeydown: (event: KeyboardEvent) => onKeydown(key, event),
    };
  }

  function getItemAttrs(key: string) {
    return buildItemAttrs(key);
  }

  function useItemAttrs(key: () => string) {
    const activity = computed<TreeItemActivity>((previous) => {
      const itemKey = key();
      const focused = focusedValue.value === itemKey;
      const selected = value.value === itemKey;
      const expanded = expandedSet.value.has(itemKey);
      if (
        previous &&
        previous.focused === focused &&
        previous.selected === selected &&
        previous.expanded === expanded
      ) {
        return previous;
      }
      return { focused, selected, expanded };
    });
    return { activity, attrs: () => buildItemAttrs(key(), activity.value) };
  }

  return {
    value,
    expanded,
    focusedValue,
    visibleItems,
    visibleIndexes,
    entries,
    select,
    setExpanded,
    toggle,
    focus,
    activate,
    getItemAttrs,
    useItemAttrs,
    rootAttrs: computed(() => ({
      role: 'tree',
      tabindex: visibleItems.value.length ? -1 : 0,
      ref: (element: unknown) => {
        rootElement = isHTMLElement(element) ? element : undefined;
      },
    })),
  };
}

export type UseTreeReturn = ReturnType<typeof useTree>;
