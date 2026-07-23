import type { InjectionKey } from 'vue';
import type { MenuColor, MenuItemValue } from './MenuTypes';

export type MenuItemOwnerContext = {
  id: string;
};

export const menuItemOwnerContextKey: InjectionKey<MenuItemOwnerContext> = Symbol('MenuItemOwnerContext');

export type MenuContext = {
  getColor: () => MenuColor;
  notifySelect: (event: MouseEvent, itemElement: HTMLElement) => void;
  closeAll: () => void;
  registerSubmenu: (close: () => void) => () => void;
  closeSubmenus: (except?: () => void) => void;
};

export const menuContextKey: InjectionKey<MenuContext> = Symbol('MenuContext');

export type MenuSelectionContext = {
  multiple: () => boolean;
  isSelected: (value: MenuItemValue) => boolean;
  toggle: (value: MenuItemValue) => void;
};

export const menuSelectionContextKey: InjectionKey<MenuSelectionContext> = Symbol('MenuSelectionContext');

export type MenuSubmenuContext = {
  close: () => void;
  closeAndFocusTrigger: () => void;
  focusTrigger: () => void;
};

export const menuSubmenuContextKey: InjectionKey<MenuSubmenuContext> = Symbol('MenuSubmenuContext');
