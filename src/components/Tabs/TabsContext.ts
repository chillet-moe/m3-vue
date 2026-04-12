import type { InjectionKey } from 'vue';
import type { UseTabsReturn } from '@/composables/useTabs';

export type TabsContext = UseTabsReturn;

export const tabsContextKey: InjectionKey<TabsContext> = Symbol('TabsContext');
