<script setup lang="ts">
import { ref } from 'vue';
import { Select, Combobox, TextField, Icon } from '@/index';
const disabled = ref(false);
const invalid = ref(false);
const nativeDisabled = ref(false);
const options = [{ label: 'Coffee', value: 'coffee' }];
</script>

<template>
  <div class="hover-controls">
    <label><input id="disabled" v-model="disabled" type="checkbox" />Disabled</label>
    <label><input id="invalid" v-model="invalid" type="checkbox" />Error</label>
    <label><input id="native-disabled" v-model="nativeDisabled" type="checkbox" />Disabled fieldset</label>
  </div>
  <fieldset class="hover-fields" :disabled="nativeDisabled">
    <section v-for="(control, index) in [TextField, Select, Combobox]" :key="index" :data-testid="`field-${index}`">
      <component
        :is="control"
        :label="['Text', 'Select', 'Combobox'][index]"
        model-value="coffee"
        :options="control === TextField ? undefined : options"
        supporting-text="Supporting text"
        :error="invalid ? 'Invalid value' : undefined"
        :disabled="disabled"
        clearable
      >
        <template #leading><Icon name="coffee" /></template>
        <template v-if="control === TextField" #trailing><button type="button">Action</button></template>
      </component>
    </section>
  </fieldset>
</template>

<style scoped>
.hover-controls {
  display: flex;
  gap: 1rem;
  padding: 2rem;
}
.hover-fields {
  display: grid;
  grid-template-columns: repeat(3, 20rem);
  gap: 1rem;
  padding: 2rem;
  border: 0;
}
</style>
