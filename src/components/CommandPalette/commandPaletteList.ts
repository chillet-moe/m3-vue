import type { InjectionKey, Ref } from 'vue';
import type { CommandPaletteCommand } from './commandSearch';

export type CommandPaletteListSlot = {
  /** Complete, ranked result set, including disabled commands. */
  entries: readonly CommandPaletteCommand[];
  scrollElement: HTMLElement | null;
  activeIndex: number;
  open: boolean;
  /** Register logical-index scrolling; pass undefined when the list unmounts. */
  setScrollToIndex: (callback: ((index: number) => void) | undefined) => void;
};

export const commandPaletteItemKey: InjectionKey<{
  activeId: Readonly<Ref<string | undefined>>;
  count: Readonly<Ref<number>>;
  optionId: (id: string) => string;
  setRow: (id: string, element: HTMLElement | null) => void;
  execute: (command: CommandPaletteCommand) => void;
}> = Symbol('CommandPaletteItem');
