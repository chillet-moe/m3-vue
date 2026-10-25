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
    const result = new Map<string, TreeEntry>();
    const visit = (nodes: readonly TreeNode[], parent: string | undefined, level: number) => {
      nodes.forEach((node, index) => {
        if (result.has(node.value)) throw new Error(`Duplicate tree value: ${node.value}`);
        const disabled = !!node.disabled || (parent !== undefined && !!result.get(parent)?.disabled);
        const branch = node.hasChildren === true || !!node.children?.length;
        result.set(node.value, { node, parent, level, position: index + 1, size: nodes.length, disabled, branch });
        visit(node.children ?? [], node.value, level + 1);
      });
    };
    visit(toValue(options.items), undefined, 1);
    return result;
  });

  const visibleItems = computed(() => {
    const visible: TreeEntry[] = [];
    const visibleValues = new Set<string>();
    for (const entry of entries.value.values()) {
      if (entry.parent !== undefined && (!visibleValues.has(entry.parent) || !expandedSet.value.has(entry.parent)))
        continue;
      visible.push(entry);
      visibleValues.add(entry.node.value);
    }
    return visible;
  });
  const visibleIndexes = computed(() => new Map(visibleItems.value.map((entry, index) => [entry.node.value, index])));
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

  watch(visibleItems, (current, previous) => {
    if (!previous.length && current.length && rootElement && rootElement === rootElement.ownerDocument.activeElement) {
      restoreFocus();
    }
    const oldKey = focused.value;
    if (oldKey === undefined || current.some((entry) => entry.node.value === oldKey)) return;
    const element = elements.get(oldKey);
    const hadFocus = element?.contains(element.ownerDocument.activeElement);
    let ancestor = previous.find((entry) => entry.node.value === oldKey)?.parent;
    while (ancestor !== undefined && !current.some((entry) => entry.node.value === ancestor)) {
      ancestor = previous.find((entry) => entry.node.value === ancestor)?.parent;
    }
    const oldIndex = previous.findIndex((entry) => entry.node.value === oldKey);
    focused.value = ancestor ?? current[Math.min(oldIndex, current.length - 1)]?.node.value;
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
    const element = elements.get(key);
    const direction =
      toValue(options.dir) ??
      (element ? element.ownerDocument.defaultView?.getComputedStyle(element).direction : 'ltr');
    const openKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const closeKey = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
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
      case openKey:
        if (entry.disabled) break;
        if (!expandedSet.value.has(key)) toggle(key);
        else next = entry.node.children?.[0]?.value;
        break;
      case closeKey:
        if (expandedSet.value.has(key) && entry.branch) toggle(key);
        else next = entry.parent;
        break;
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
        const ordered = [...visible.slice(index + 1), ...visible.slice(0, index + 1)];
        next = ordered.find((item) => item.node.label.trim().toLocaleLowerCase().startsWith(query.toLocaleLowerCase()))
          ?.node.value;
      }
    }
    event.preventDefault();
    if (next !== undefined) focus(next);
  }

  function getItemAttrs(key: string) {
    const entry = entries.value.get(key);
    return {
      role: 'treeitem',
      tabindex: focusedValue.value === key ? 0 : -1,
      'aria-label': entry?.node.label,
      'aria-level': entry?.level,
      'aria-posinset': entry?.position,
      'aria-setsize': entry?.size,
      'aria-expanded': entry?.branch ? expandedSet.value.has(key) : undefined,
      'aria-busy': entry?.node.busy || undefined,
      'aria-selected': entry?.node.selectable === false ? undefined : value.value === key,
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
