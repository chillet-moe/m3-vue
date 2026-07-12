<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Select, type SelectModelValue } from '@/components/Select';
import { TextField, type TextFieldSize } from '@/components/TextField';
import { coffeeOptions } from './selectOptions';

const sizes: TextFieldSize[] = ['extra-small', 'small', 'medium'];
const queries = ref<Record<TextFieldSize, string>>({
  'extra-small': 'Espresso',
  small: 'Pour-over',
  medium: 'Cold brew',
});
const selections = ref<Record<TextFieldSize, SelectModelValue>>({
  'extra-small': 'espresso',
  small: 'pour-over',
  medium: 'cold-brew',
});
</script>

<template>
  <div class="field-size-demo">
    <div v-for="size in sizes" :key="size" class="field-size-toolbar">
      <TextField v-model="queries[size]" class="field-size-control" aria-label="Search" :size="size">
        <template #leading>
          <span class="m3-icon" aria-hidden="true">search</span>
        </template>
        <template #trailing>
          <span class="m3-icon" aria-hidden="true">close</span>
        </template>
      </TextField>
      <Select
        v-model="selections[size]"
        class="field-size-control"
        label="Coffee"
        :options="coffeeOptions"
        :size="size"
      />
      <Button :size="size">Apply</Button>
    </div>
  </div>
</template>

<style scoped>
.field-size-demo {
  display: grid;
  gap: 1rem;
}

.field-size-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.field-size-toolbar > .field-size-control {
  flex: 1 1 10rem;
}
</style>
