import '@/styles/themes/default.css';
import { createApp, h, ref } from 'vue';
import { CommandPalette, Dialog, type CommandPaletteCommand, type CommandPaletteListSlot } from '@/index';

import VirtualCommandList from '../../../docs/demos/command-palette/VirtualCommandList.vue';

const virtual = new URLSearchParams(location.search).has('virtual');
const initial: CommandPaletteCommand[] = [
  { id: 'file', name: 'Save', group: 'File' },
  { id: 'disabled', name: 'Delete', disabled: true },
  { id: 'workspace', name: 'Save', group: 'Workspace' },
  { id: 'preferences', name: 'Preferences', keywords: ['设置'] },
  { id: 'focus', name: 'Focus editor' },
  ...Array.from({ length: 40 }, (_, index) => ({ id: String(index), name: `Action ${index}` })),
];
const commands = ref(initial);
declare global {
  interface Window {
    setCommands: (items: CommandPaletteCommand[]) => void;
  }
}
window.setCommands = (items) => {
  commands.value = items;
};

createApp({
  setup() {
    const open = ref(false);
    const preferences = ref(false);
    const executed = ref<string[]>([]);
    const editor = ref<HTMLInputElement>();
    function select(command: CommandPaletteCommand) {
      executed.value.push(command.id);
      if (command.id === 'preferences') preferences.value = true;
      if (command.id === 'focus') editor.value?.focus();
    }

    return () => [
      h('button', { onClick: () => (open.value = true) }, 'Find commands'),
      h('input', { ref: editor, 'aria-label': 'Editor' }),
      h('output', { id: 'executed' }, executed.value.join(',')),
      h(
        CommandPalette,
        {
          commands: commands.value,
          open: open.value,
          'onUpdate:open': (v) => (open.value = v),
          onSelect: select,
        },
        virtual ? { list: (list: CommandPaletteListSlot) => h(VirtualCommandList, { list }) } : undefined,
      ),
      h(
        Dialog,
        { open: preferences.value, 'onUpdate:open': (v) => (preferences.value = v) },
        {
          headline: () => 'Preferences',
          default: () => h('input', { autofocus: true, 'aria-label': 'Theme' }),
        },
      ),
    ];
  },
}).mount('#app');
