<script setup lang="ts">
import { computed, nextTick, provide, ref, shallowReactive, useId, useTemplateRef, watch } from 'vue';
import { Icon } from '@/components/Icon';
import CommandPaletteItem from './CommandPaletteItem.vue';
import { commandPaletteItemKey, type CommandPaletteListSlot } from './commandPaletteList';
import { useNativeDialog } from '@/composables/useNativeDialog';
import { useM3Locale } from '@/locales/context';
import { provideRowSize, type RowSize } from '@/styles/rowSize';
import { useShape, type M3Shape } from '@/styles/shape';
import { searchCommands, type CommandPaletteCommand } from './commandSearch';

export type CommandPaletteProps = {
  /** Commands available in the current context, in browsing order. */
  commands: readonly CommandPaletteCommand[];
  /** Accessible name of the dialog. Defaults to the localized palette name. */
  label?: string;
  /** Result row size. Inherits the nearest row size. */
  size?: RowSize;
  /** Panel corner style. Inherits the shared shape preference. */
  shape?: M3Shape;
};
const props = defineProps<CommandPaletteProps>();
const open = defineModel<boolean>('open', { default: false });
const emit = defineEmits<{
  /** Reports the chosen command after closing the native modal. */
  select: [command: CommandPaletteCommand];
}>();

defineSlots<{
  /** Replaces the result rows with a custom or virtualized list. */
  list(props: CommandPaletteListSlot): any;
}>();

const { messages, locale } = useM3Locale();
const rowSize = provideRowSize(() => props.size);
const shape = useShape(() => props.shape);
const listId = `command-results-${useId()}`;
const optionId = (id: string) => `${listId}-${encodeURIComponent(id)}`;
const dialogRef = useTemplateRef<HTMLDialogElement>('dialog');
const listRef = useTemplateRef<HTMLElement>('list');
const query = ref('');
const activeId = ref<string>();
let composing = false;

const { close, onBeforeToggle, onClose, onBackdropClick } = useNativeDialog({ dialogRef, open });
watch(open, (visible) => {
  if (visible) query.value = '';
  composing = false;
});

const results = computed(() => (open.value ? searchCommands(props.commands, query.value, locale.value) : []));
const activeIndex = computed(() => {
  const id = activeId.value;
  return id === undefined ? -1 : results.value.findIndex((command) => command.id === id && !command.disabled);
});
watch(
  [query, activeIndex, () => results.value.find((command) => !command.disabled)?.id],
  ([currentQuery, index, first], [previousQuery]) => {
    if (currentQuery !== previousQuery || index < 0) activeId.value = first;
  },
  { immediate: true },
);

const mountedRows = shallowReactive(new Map<string, HTMLElement>());
const activeDescendant = computed(() => {
  const id = activeId.value;
  return open.value && id !== undefined && mountedRows.has(id) ? optionId(id) : undefined;
});

let scrollToIndex: ((index: number) => void) | undefined;
function revealActive() {
  if (activeIndex.value < 0 || activeId.value === undefined) return;
  if (scrollToIndex) scrollToIndex(activeIndex.value);
  else mountedRows.get(activeId.value)?.scrollIntoView({ block: 'nearest' });
}
watch([results, activeId, activeIndex], () => nextTick(revealActive));

function setScrollToIndex(callback: typeof scrollToIndex) {
  scrollToIndex = callback;
  if (callback) void nextTick(revealActive);
}
const list = computed<CommandPaletteListSlot>(() => ({
  entries: results.value,
  scrollElement: listRef.value,
  activeIndex: activeIndex.value,
  open: open.value,
  setScrollToIndex,
}));

provide(commandPaletteItemKey, {
  activeId,
  count: computed(() => results.value.length),
  optionId,
  execute,
  setRow(id, element) {
    if (element) mountedRows.set(id, element);
    else mountedRows.delete(id);
  },
});

function execute(command: CommandPaletteCommand) {
  if (!dialogRef.value?.open || command.disabled) return;
  // Release modality and let the browser restore focus before handing control to the caller.
  close();
  emit('select', command);
}

function handleKeydown(event: KeyboardEvent) {
  if (composing || event.isComposing || event.keyCode === 229 || event.defaultPrevented) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowUp': {
      event.preventDefault();
      const commands = results.value;
      if (activeIndex.value < 0) return;
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      let index = activeIndex.value;
      do {
        index = (index + direction + commands.length) % commands.length;
      } while (commands[index]!.disabled);
      // Cycling to the only enabled command must also reveal it after manual scrolling.
      if (index === activeIndex.value) revealActive();
      else activeId.value = commands[index]!.id;
      break;
    }
    case 'Enter': {
      event.preventDefault();
      const command = results.value[activeIndex.value];
      if (command) execute(command);
      break;
    }
  }
}
</script>

<template>
  <dialog
    ref="dialog"
    class="m3-command-palette m3-row-size"
    :data-size="rowSize"
    data-scope="command-palette"
    data-part="root"
    data-m3-shape
    :data-shape="shape"
    :aria-label="label ?? messages.commandPalette.label"
    @beforetoggle="onBeforeToggle"
    @close="onClose"
    @click="onBackdropClick"
    @cancel="composing && $event.preventDefault()"
  >
    <label class="palette-search" data-scope="command-palette" data-part="search">
      <Icon class="palette-search-icon" name="search" aria-hidden="true" />
      <input
        v-model="query"
        class="palette-input"
        data-scope="command-palette"
        data-part="input"
        role="combobox"
        aria-autocomplete="list"
        :aria-label="messages.commandPalette.search"
        :placeholder="messages.commandPalette.search"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-activedescendant="activeDescendant"
        autocomplete="off"
        autofocus
        @compositionstart="composing = true"
        @compositionend="composing = false"
        @keydown="handleKeydown"
      />
    </label>
    <div
      :id="listId"
      ref="list"
      class="palette-results"
      data-scope="command-palette"
      data-part="results"
      role="listbox"
      :aria-label="label ?? messages.commandPalette.label"
    >
      <slot name="list" v-bind="list">
        <CommandPaletteItem v-for="(command, index) in results" :key="command.id" :command="command" :index="index" />
      </slot>
    </div>
    <div role="status" class="palette-status" data-scope="command-palette" data-part="status">
      {{ open && !results.length ? messages.commandPalette.noResults : '' }}
    </div>
  </dialog>
</template>

<style scoped src="./CommandPalette.css"></style>
