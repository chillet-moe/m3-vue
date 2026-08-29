<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { TextField, type TextFieldSize } from '@/components/TextField';

const sizes: TextFieldSize[] = ['extra-small', 'small', 'medium'];
const values = ref<Record<TextFieldSize, string>>({
  'extra-small': 'Value',
  small: 'Value',
  medium: 'Value',
});
</script>

<template>
  <div class="outline-comparison">
    <template v-for="size in sizes" :key="size">
      <code class="outline-comparison__size">{{ size }}</code>
      <TextField
        v-model="values[size]"
        class="outline-comparison__field"
        label="TextField"
        shape="square"
        :size="size"
      />
      <Button variant="outlined" shape="square" :size="size">Outlined Button</Button>
    </template>
  </div>
</template>

<style scoped>
.outline-comparison {
  display: grid;
  grid-template-columns: max-content minmax(12rem, 1fr) max-content;
  align-items: center;
  gap: 1rem;
  inline-size: min(100%, 44rem);
}

.outline-comparison__size {
  color: var(--md-sys-color-on-surface-variant);
}

.outline-comparison__field {
  inline-size: 100%;
}

@media (max-width: 32rem) {
  .outline-comparison {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .outline-comparison__size:not(:first-child) {
    margin-block-start: 0.5rem;
  }
}
</style>
