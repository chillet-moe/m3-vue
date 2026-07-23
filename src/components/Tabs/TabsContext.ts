import type { InjectionKey } from 'vue';
import type { UseTabsReturn } from '@/composables/useTabs';

export type TabsContext = Pick<
  UseTabsReturn,
  'value' | 'orientation' | 'triggerListAttrs' | 'getTriggerAttrs' | 'getPanelAttrs'
>;

export const tabsContextKey: InjectionKey<TabsContext> = Symbol('TabsContext');
