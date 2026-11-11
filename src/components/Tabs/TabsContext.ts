import type { InjectionKey, Ref } from 'vue';
import type { UseTabsReturn } from '@/composables/useTabs';

export type TabsContext = Pick<
  UseTabsReturn,
  'value' | 'orientation' | 'triggerListAttrs' | 'getTriggerAttrs' | 'getPanelAttrs'
> & { hasLineIndicator: Readonly<Ref<boolean>> };

export const tabsContextKey: InjectionKey<TabsContext> = Symbol('TabsContext');
