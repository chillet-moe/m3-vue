import '@/styles/themes/default.css';
import { Combobox, Select, type SelectModelValue } from '@/index';
import { createApp, h, ref } from 'vue';

const options = [
  { value: '', label: 'Empty identifier' },
  { value: 0, label: 'Zero' },
];

createApp({
  setup() {
    const multiple = ref<SelectModelValue>(['unloaded', 0, '']);
    const disabled = ref(false);
    const submissions = ref<Record<string, FormDataEntryValue[][]>>({});

    function form(id: string, children: ReturnType<typeof h>[]) {
      return h(
        'form',
        {
          id,
          onSubmit(event: SubmitEvent) {
            event.preventDefault();
            const values = new FormData(event.currentTarget as HTMLFormElement).getAll('choice');
            (submissions.value[id] ??= []).push(values);
          },
        },
        [
          ...children,
          h('button', { type: 'submit' }, 'Submit'),
          h('output', JSON.stringify(submissions.value[id] ?? [])),
        ],
      );
    }

    return () =>
      h('main', { style: { display: 'grid', gap: '24px', width: '320px' } }, [
        form('plain', [h(Select, { label: 'Plain', name: 'choice', options, required: true, clearable: true })]),
        form('filterable', [
          h(Select, { label: 'Filterable', name: 'choice', options, required: true, filterable: true }),
        ]),
        form('combobox', [h(Combobox, { label: 'Combobox', name: 'choice', options, required: true })]),
        form('external', []),
        h(Select, {
          label: 'External multiple',
          name: 'choice',
          options,
          form: 'external',
          multiple: true,
          modelValue: multiple.value,
          disabled: disabled.value,
          required: true,
        }),
        h('button', { onClick: () => (multiple.value = []) }, 'Clear external'),
        h('button', { onClick: () => (disabled.value = !disabled.value) }, 'Toggle disabled'),
      ]);
  },
}).mount('#app');
