import { type App, type ComputedRef, type InjectionKey, computed, inject, provide, toValue } from 'vue';
import { en } from './en';
import type { M3LocaleDefinition, M3LocaleOptions, M3LocaleSource, M3MessageOverrides, M3Messages } from './types';

export type M3LocaleContext = {
  locale: ComputedRef<string>;
  messages: ComputedRef<M3Messages>;
};

export const m3LocaleContextKey: InjectionKey<M3LocaleContext> = Symbol('M3LocaleContext');

function isLocaleDefinition(source: M3LocaleSource | undefined): source is M3LocaleDefinition {
  return typeof source === 'object' && source !== null;
}

function mergeMessages(base: M3Messages, overrides: M3MessageOverrides | undefined): M3Messages {
  if (!overrides) {
    return base;
  }

  return {
    common: { ...base.common, ...overrides.common },
    datePicker: { ...base.datePicker, ...overrides.datePicker },
    dateRangePicker: { ...base.dateRangePicker, ...overrides.dateRangePicker },
    timePicker: { ...base.timePicker, ...overrides.timePicker },
    textField: { ...base.textField, ...overrides.textField },
    select: { ...base.select, ...overrides.select },
  };
}

export function createM3LocaleContext(options: M3LocaleOptions = {}, inherited?: M3LocaleContext): M3LocaleContext {
  const localeSource = computed(() => toValue(options.locale));

  const locale = computed(() => {
    const source = localeSource.value;
    return (isLocaleDefinition(source) ? source.locale : source) ?? inherited?.locale.value ?? en.locale;
  });

  const messages = computed(() => {
    const source = localeSource.value;
    const base = isLocaleDefinition(source) ? source.messages : (inherited?.messages.value ?? en.messages);
    return mergeMessages(base, toValue(options.messages));
  });

  return { locale, messages };
}

/** Provides reactive locale configuration to the current component subtree. */
export function provideM3Locale(options: M3LocaleOptions = {}): M3LocaleContext {
  const context = createM3LocaleContext(options, inject(m3LocaleContextKey, undefined));
  provide(m3LocaleContextKey, context);
  return context;
}

/** Returns the nearest locale context, falling back to the built-in English locale. */
export function useM3Locale(): M3LocaleContext {
  return inject(m3LocaleContextKey, undefined) ?? createM3LocaleContext();
}

export function installM3Locale(app: App, options: M3LocaleOptions = {}): M3LocaleContext {
  const context = createM3LocaleContext(options);
  app.provide(m3LocaleContextKey, context);
  return context;
}
