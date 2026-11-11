import '@/styles/theme.css';
import '@/styles/themes/default.css';
import { createApp, h, ref } from 'vue';
import InputOtp from '@/components/InputOtp/InputOtp.vue';

createApp({
  setup() {
    const value = ref('');
    const completed = ref<string[]>([]);
    return () => [
      h(InputOtp, {
        type: 'text',
        length: 2,
        name: 'code',
        modelValue: value.value,
        'onUpdate:modelValue': (nextValue) => {
          value.value = nextValue;
        },
        onComplete: (code) => {
          completed.value.push(code);
        },
      }),
      h('output', { 'data-testid': 'completed' }, JSON.stringify(completed.value)),
    ];
  },
}).mount('#app');
