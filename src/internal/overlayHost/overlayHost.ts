import type { ShallowRef, VNodeChild } from 'vue';

export type OverlayEntry = {
  id: number;
  render: () => VNodeChild;
  onHostUnmounted?: (error: Error) => void;
};

export type OverlayEntryHandle = {
  remove: () => void;
};

let activeEntries: ShallowRef<OverlayEntry[]> | undefined;
let nextEntryId = 0;

export function registerOverlayHost(entries: ShallowRef<OverlayEntry[]>): () => void {
  if (activeEntries && activeEntries !== entries) {
    throw new Error('Only one OverlayHost can be mounted at a time.');
  }

  activeEntries = entries;

  return () => {
    if (activeEntries !== entries) {
      return;
    }

    activeEntries = undefined;

    const mountedEntries = entries.value;
    entries.value = [];

    if (mountedEntries.length === 0) {
      return;
    }

    const error = new Error('OverlayHost was unmounted before the overlay completed.');

    for (const entry of mountedEntries) {
      entry.onHostUnmounted?.(error);
    }
  };
}

export function showOverlayEntry(options: Omit<OverlayEntry, 'id'>): OverlayEntryHandle {
  const entries = activeEntries;

  if (!entries) {
    throw new Error('OverlayHost must be mounted before calling a programmatic overlay function.');
  }

  const entry: OverlayEntry = {
    id: ++nextEntryId,
    ...options,
  };
  let removed = false;

  entries.value = [...entries.value, entry];

  return {
    remove: () => {
      if (removed) {
        return;
      }

      removed = true;
      entries.value = entries.value.filter((candidate) => candidate !== entry);
    },
  };
}
