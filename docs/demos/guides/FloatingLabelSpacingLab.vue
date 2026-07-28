<script setup lang="ts">
import { computed, ref } from 'vue';
import { Combobox } from '@/components/Combobox';
import { Select, type SelectModelValue } from '@/components/Select';
import { Slider } from '@/components/Slider';
import { Switch } from '@/components/Switch';
import { TextField, type FieldMargin } from '@/components/TextField';
import { coffeeOptions, stateOptions } from '../shared/selectOptions';

const spacing = ref(16);
const showLayoutBoxes = ref(true);
const marginMode = ref<SelectModelValue>('none');

const marginOptions = [
  { label: 'None', value: 'none' },
  { label: 'Dense', value: 'dense' },
  { label: 'Normal', value: 'normal' },
];

const fieldMargin = computed<FieldMargin>(() => {
  return marginMode.value === 'dense' || marginMode.value === 'normal' ? marginMode.value : 'none';
});

const name = ref('');
const email = ref('ada@example.com');
const search = ref('');
const coffee = ref<SelectModelValue>('pour-over');
const secondaryCoffee = ref<SelectModelValue>(undefined);
const state = ref<SelectModelValue>('california');
const secondaryState = ref<SelectModelValue>(undefined);
</script>

<template>
  <div class="floating-label-spacing-lab">
    <div class="floating-label-spacing-lab__controls">
      <label class="floating-label-spacing-lab__spacing-control">
        <span class="floating-label-spacing-lab__control-label">
          Vertical gap
          <output class="floating-label-spacing-lab__value">{{ spacing }}px</output>
        </span>
        <Slider
          v-model:value="spacing"
          :min="0"
          :max="40"
          :step="1"
          size="small"
          :value-indicator="false"
          aria-label="Vertical gap in pixels"
        />
      </label>

      <Switch v-model:checked="showLayoutBoxes">Show nominal component boxes</Switch>

      <Select
        v-model="marginMode"
        label="Component margin"
        :options="marginOptions"
        size="small"
        description="Outer margin is added to the parent gap."
      />
    </div>

    <div
      class="floating-label-spacing-lab__stack"
      :data-show-layout-boxes="showLayoutBoxes ? 'true' : undefined"
      :style="{ gap: `${spacing}px` }"
    >
      <TextField
        v-model="name"
        class="floating-label-spacing-lab__field"
        label="TextField · Name"
        placeholder="Ada Lovelace"
        :margin="fieldMargin"
      />

      <Select
        v-model="coffee"
        class="floating-label-spacing-lab__field"
        label="Select · Coffee"
        :options="coffeeOptions"
        :margin="fieldMargin"
      />

      <Combobox
        v-model="state"
        class="floating-label-spacing-lab__field"
        label="Combobox · State"
        :options="stateOptions"
        placeholder="Choose a state"
        filter-placeholder="Filter states"
        :margin="fieldMargin"
      />

      <TextField
        v-model="email"
        class="floating-label-spacing-lab__field"
        label="TextField · Email"
        type="email"
        :margin="fieldMargin"
      />

      <Select
        v-model="secondaryCoffee"
        class="floating-label-spacing-lab__field"
        label="Select · Empty value"
        :options="coffeeOptions"
        placeholder="Choose a coffee"
        :margin="fieldMargin"
      />

      <Combobox
        v-model="secondaryState"
        class="floating-label-spacing-lab__field"
        label="Combobox · Empty value"
        :options="stateOptions"
        placeholder="Choose a state"
        filter-placeholder="Filter states"
        :margin="fieldMargin"
      />

      <TextField
        v-model="search"
        class="floating-label-spacing-lab__field"
        label="TextField · Search"
        placeholder="Search"
        :margin="fieldMargin"
      />
    </div>
  </div>
</template>

<style scoped>
.floating-label-spacing-lab {
  display: grid;
  gap: 2rem;
  inline-size: min(100%, 28rem);
  margin-inline: auto;
}

.floating-label-spacing-lab__controls {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-shape-card);
  background: var(--md-sys-color-surface-container-low);
}

.floating-label-spacing-lab__spacing-control {
  display: grid;
  gap: 0.5rem;
}

.floating-label-spacing-lab__control-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  color: var(--md-sys-color-on-surface);
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
  font-weight: var(--md-sys-typescale-body-medium-weight);
}

.floating-label-spacing-lab__value {
  min-inline-size: 3.5rem;
  color: var(--md-sys-color-primary);
  font-variant-numeric: tabular-nums;
  text-align: end;
}

.floating-label-spacing-lab__stack {
  display: grid;
}

.floating-label-spacing-lab__field {
  inline-size: 100%;
}

.floating-label-spacing-lab__stack[data-show-layout-boxes='true'] .floating-label-spacing-lab__field {
  outline: 1px dashed var(--md-sys-color-tertiary);
  background: --translucent(var(--md-sys-color-tertiary), 0.06);
}
</style>
