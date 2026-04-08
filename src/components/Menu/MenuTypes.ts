export type MenuColor = 'standard' | 'vibrant';

export type MenuItemValue = string | number;

export type MenuModelValue = MenuItemValue | MenuItemValue[] | undefined;

export type MenuContentKey = string | number;

type MenuContentBase = {
  key?: MenuContentKey;
};

type MenuTextContentBase = MenuContentBase & {
  label: string;
  supportingText?: string;
  trailingText?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  badge?: string;
  disabled?: boolean;
};

export type MenuActionContent = MenuTextContentBase & {
  type?: 'item';
  value?: MenuItemValue;
  closeOnSelect?: boolean;
  selected?: boolean;
  role?: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox';
  checked?: boolean;
};

export type MenuSubmenuContent = MenuTextContentBase & {
  type: 'submenu';
  color?: MenuColor;
  debugSafeTriangle?: boolean;
  items: MenuContentItem[];
};

export type MenuLabelContent = MenuContentBase & {
  type: 'label';
  label: string;
};

export type MenuDividerContent = MenuContentBase & {
  type: 'divider';
};

export type MenuGapContent = MenuContentBase & {
  type: 'gap';
};

export type MenuGroupContent = MenuContentBase & {
  type: 'group';
  items: MenuContentItem[];
};

export type MenuContentItem =
  | MenuActionContent
  | MenuSubmenuContent
  | MenuLabelContent
  | MenuDividerContent
  | MenuGapContent
  | MenuGroupContent;
