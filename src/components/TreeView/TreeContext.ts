import type { InjectionKey } from 'vue';
import type { TreeNode, UseTreeReturn } from '@/composables/useTree';

export type TreeItemSlotProps = {
  item: TreeNode;
  selected: boolean;
  expanded: boolean;
  focused: boolean;
  disabled: boolean;
};

export const treeContextKey: InjectionKey<UseTreeReturn> = Symbol('TreeView');
