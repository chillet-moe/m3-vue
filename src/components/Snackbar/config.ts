import {
  computed,
  inject,
  provide,
  type App,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
  toValue,
} from 'vue';
import type { SnackbarProps } from './Snackbar.vue';

export type SnackbarPosition = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';

export type ShowSnackbarDefaults = Pick<SnackbarProps, 'actionOnNewLine' | 'dismissible' | 'dismissButtonLabel'> & {
  /** Milliseconds before the snackbar closes automatically. Use `null` to disable auto close. */
  duration?: number | null;

  /** Value returned when the snackbar closes automatically. */
  timeoutValue?: string;

  /** Value returned when the dismiss button closes the snackbar. */
  dismissValue?: string;

  /** Where the snackbar stack is placed in the viewport. */
  position?: SnackbarPosition;
};

export type M3SnackbarOptions = {
  /** Application-level defaults for programmatic snackbars. Refs and getters are supported. */
  snackbarDefaults?: MaybeRefOrGetter<ShowSnackbarDefaults | undefined>;
};

export const snackbarDefaultsContextKey: InjectionKey<ComputedRef<ShowSnackbarDefaults | undefined>> =
  Symbol('SnackbarDefaultsContext');

/** Provides reactive showSnackbar defaults to descendant components. */
export function provideSnackbarDefaults(
  defaults: MaybeRefOrGetter<ShowSnackbarDefaults | undefined>,
): ComputedRef<ShowSnackbarDefaults | undefined> {
  const inherited = inject(snackbarDefaultsContextKey, undefined);
  const context = computed(() => ({ ...inherited?.value, ...toValue(defaults) }));
  provide(snackbarDefaultsContextKey, context);
  return context;
}

export function installM3Snackbar(app: App, options: M3SnackbarOptions = {}): void {
  if (options.snackbarDefaults === undefined) {
    return;
  }

  app.provide(
    snackbarDefaultsContextKey,
    computed(() => toValue(options.snackbarDefaults)),
  );
}

let activeDefaults: (() => ShowSnackbarDefaults | undefined) | undefined;

export function registerSnackbarDefaults(getDefaults: () => ShowSnackbarDefaults | undefined): () => void {
  activeDefaults = getDefaults;

  return () => {
    if (activeDefaults === getDefaults) {
      activeDefaults = undefined;
    }
  };
}

export function getSnackbarDefaults(): ShowSnackbarDefaults | undefined {
  return activeDefaults?.();
}
