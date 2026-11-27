<script setup lang="ts">
import { computed, ref, useId, useTemplateRef, watch, watchPostEffect } from 'vue';
import { Icon } from '@/components/Icon';
import { vStateLayer } from '@/components/StateLayer/state-layer';
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
const enabled = computed(() => results.value.filter((command) => !command.disabled));
watch(
  [enabled, query],
  ([commands, currentQuery], [, previousQuery]) => {
    if (currentQuery !== previousQuery || !commands.some((command) => command.id === activeId.value)) {
      activeId.value = commands[0]?.id;
    }
  },
  { immediate: true },
);

watchPostEffect(() => {
  const index = results.value.findIndex((command) => command.id === activeId.value);
  if (index >= 0) listRef.value?.children[index]?.scrollIntoView({ block: 'nearest' });
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
      const commands = enabled.value;
      if (!commands.length) return;
      const index = commands.findIndex((command) => command.id === activeId.value);
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      activeId.value = commands[(index + direction + commands.length) % commands.length]!.id;
      break;
    }
    case 'Enter': {
      event.preventDefault();
      const command = enabled.value.find((item) => item.id === activeId.value);
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
        :aria-activedescendant="activeId === undefined ? undefined : optionId(activeId)"
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
      <div
        v-for="command in results"
        :id="optionId(command.id)"
        :key="command.id"
        v-state-layer
        class="palette-option m3-state-layer"
        data-scope="command-palette"
        data-part="option"
        role="option"
        :aria-selected="command.id === activeId"
        :aria-disabled="command.disabled || undefined"
        @mousedown.prevent
        @click="execute(command)"
      >
        <Icon v-if="command.icon" :name="command.icon" aria-hidden="true" />
        <span class="palette-name" data-scope="command-palette" data-part="name">{{ command.name }}</span>
        <span v-if="command.group" class="palette-group" data-scope="command-palette" data-part="group">{{
          command.group
        }}</span>
        <kbd v-if="command.shortcut" class="palette-shortcut" data-scope="command-palette" data-part="shortcut">{{
          command.shortcut
        }}</kbd>
      </div>
    </div>
    <div role="status" class="palette-status" data-scope="command-palette" data-part="status">
      {{ open && !results.length ? messages.commandPalette.noResults : '' }}
    </div>
  </dialog>
</template>

<style scoped src="./CommandPalette.css"></style>
