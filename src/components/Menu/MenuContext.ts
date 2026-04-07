import type { InjectionKey } from 'vue';
import type { MenuColor } from './Menu.vue';

export type MenuContext = {
  id: string;
  getColor: () => MenuColor;
  notifySelect: (event: MouseEvent, itemElement: HTMLElement) => void;
  registerSubmenu: (close: () => void) => () => void;
  closeSubmenus: (except?: () => void) => void;
};

export const menuContextKey: InjectionKey<MenuContext> = Symbol('MenuContext');

export type MenuSubmenuContext = {
  close: () => void;
  closeAndFocusTrigger: () => void;
  focusTrigger: () => void;
};

export const menuSubmenuContextKey: InjectionKey<MenuSubmenuContext> = Symbol('MenuSubmenuContext');
