import { inject, provide, type InjectionKey, type ShallowRef, type VNodeChild } from 'vue';
import type { ShowSnackbarDefaults } from '@/components/Snackbar/config';

export type OverlayEntry = {
  id: number;
  render: () => VNodeChild;
  onHostUnmounted?: (error: Error) => void;
};
export type OverlayEntryHandle = { remove: () => void };
const hostIdentity: unique symbol = Symbol('OverlayHostController');
/** Runtime identity shared by an OverlayHost and its programmatic callers. */
export type OverlayHostController = { readonly [hostIdentity]: true };
type HostState = {
  entries?: ShallowRef<OverlayEntry[]>;
  element?: HTMLElement;
  getDefaults?: () => ShowSnackbarDefaults | undefined;
  nextId: number;
};
const hosts = new WeakMap<OverlayHostController, HostState>();
const contextKey: InjectionKey<OverlayHostController> = Symbol('OverlayHost');

/** Create one controller per independently owned UI host. */
export function createOverlayHost(): OverlayHostController {
  const host = Object.freeze({ [hostIdentity]: true as const });
  hosts.set(host, { nextId: 0 });
  return host;
}

export function registerOverlayHost(
  host: OverlayHostController,
  entries: ShallowRef<OverlayEntry[]>,
  element: HTMLElement,
  getDefaults: () => ShowSnackbarDefaults | undefined,
) {
  const state = hosts.get(host)!;
  if (state.entries) throw new Error('This overlay host controller is already mounted.');
  Object.assign(state, { entries, element, getDefaults });
  return () => {
    if (state.entries !== entries) return;
    state.entries = undefined;
    state.element = undefined;
    state.getDefaults = undefined;
    const pending = entries.value;
    entries.value = [];
    const error = new Error('OverlayHost was disposed before the overlay completed.');
    for (const entry of pending) entry.onHostUnmounted?.(error);
  };
}

export const getOverlayHostElement = (host: OverlayHostController) => hosts.get(host)?.element;
export const getOverlayHostSnackbarDefaults = (host: OverlayHostController) => hosts.get(host)?.getDefaults?.();

/** Bind composable overlay calls in this component subtree to a specific host. */
export function provideOverlayHost(host: OverlayHostController) {
  provide(contextKey, host);
  return host;
}
export function useOverlayHost(): OverlayHostController {
  const host = inject(contextKey);
  if (!host) throw new Error('Provide an overlay host before using an overlay composable.');
  return host;
}
export function showOverlayEntry(host: OverlayHostController, options: Omit<OverlayEntry, 'id'>): OverlayEntryHandle {
  const state = hosts.get(host);
  const entries = state?.entries;
  if (!entries) throw new Error('OverlayHost must be mounted before showing an overlay.');
  const entry = { ...options, id: ++state.nextId };
  entries.value = [...entries.value, entry];
  return {
    remove: () => {
      entries.value = entries.value.filter((item) => item !== entry);
    },
  };
}
