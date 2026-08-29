<script setup lang="ts">
import { computed, ref } from 'vue';
import { Button } from '@/components/Button';
import { CheckBox } from '@/components/CheckBox';
import { Combobox } from '@/components/Combobox';
import { Divider } from '@/components/Divider';
import { Select, type SelectModelValue } from '@/components/Select';
import { Slider } from '@/components/Slider';
import { Switch } from '@/components/Switch';
import { TextField } from '@/components/TextField';
import { coffeeOptions, stateOptions } from '../shared/selectOptions';

const spacing = ref(8);
const showLayoutBoxes = ref(true);
const labelClearanceInput = ref('0.5rem');
const labelClearance = computed(() => labelClearanceInput.value.trim() || '0rem');

const name = ref('');
const email = ref('ada@example.com');
const search = ref('');
const coffee = ref<SelectModelValue>('pour-over');
const secondaryCoffee = ref<SelectModelValue>(undefined);
const state = ref<SelectModelValue>('california');
const secondaryState = ref<SelectModelValue>(undefined);
const productUpdates = ref(true);
const usageAnalytics = ref(false);
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

      <TextField
        v-model="labelClearanceInput"
        label="Label clearance"
        size="small"
        supporting-text="CSS length added at the field's block-start edge."
      />
    </div>

    <div class="floating-label-spacing-lab__previews">
      <section class="floating-label-spacing-lab__preview">
        <div class="floating-label-spacing-lab__preview-heading">
          <h3>Field-only stack</h3>
          <p>Useful for comparing adjacent floating labels directly.</p>
        </div>

        <div
          class="floating-label-spacing-lab__stack"
          :data-show-layout-boxes="showLayoutBoxes ? 'true' : undefined"
          :style="{ rowGap: `${spacing}px` }"
        >
          <TextField
            v-model="name"
            class="floating-label-spacing-lab__item floating-label-spacing-lab__field"
            label="TextField · Name"
            placeholder="Ada Lovelace"
            :label-clearance="labelClearance"
          />

          <Select
            v-model="coffee"
            class="floating-label-spacing-lab__item floating-label-spacing-lab__field"
            label="Select · Coffee"
            :options="coffeeOptions"
            :label-clearance="labelClearance"
          />

          <Combobox
            v-model="secondaryState"
            class="floating-label-spacing-lab__item floating-label-spacing-lab__field"
            label="Combobox · Empty value"
            :options="stateOptions"
            placeholder="Choose a state"
            filter-placeholder="Filter states"
            :label-clearance="labelClearance"
          />

          <TextField
            v-model="email"
            class="floating-label-spacing-lab__item floating-label-spacing-lab__field"
            label="TextField · Email"
            type="email"
            supporting-text="Used for account notifications"
            :label-clearance="labelClearance"
          />
        </div>
      </section>

      <section class="floating-label-spacing-lab__preview">
        <div class="floating-label-spacing-lab__preview-heading">
          <h3>Mixed settings panel</h3>
          <p>Compare fields with the text, selection controls, divider, and actions that normally surround them.</p>
        </div>

        <div
          class="floating-label-spacing-lab__stack"
          :data-show-layout-boxes="showLayoutBoxes ? 'true' : undefined"
          :style="{ rowGap: `${spacing}px` }"
        >
          <TextField
            v-model="search"
            class="floating-label-spacing-lab__item floating-label-spacing-lab__field"
            label="Workspace name"
            placeholder="Analytical Engine"
            :label-clearance="labelClearance"
          />

          <Switch v-model:checked="productUpdates" class="floating-label-spacing-lab__item"> Product updates </Switch>

          <Select
            v-model="secondaryCoffee"
            class="floating-label-spacing-lab__item floating-label-spacing-lab__field"
            label="Default coffee"
            :options="coffeeOptions"
            placeholder="Choose a coffee"
            :label-clearance="labelClearance"
          />

          <CheckBox v-model:checked="usageAnalytics" class="floating-label-spacing-lab__item">
            Share anonymous usage analytics
          </CheckBox>

          <Combobox
            v-model="state"
            class="floating-label-spacing-lab__item floating-label-spacing-lab__field"
            label="Billing state"
            :options="stateOptions"
            placeholder="Choose a state"
            filter-placeholder="Filter states"
            :label-clearance="labelClearance"
          />

          <Divider class="floating-label-spacing-lab__item" />

          <p class="floating-label-spacing-lab__item floating-label-spacing-lab__notice">
            These preferences apply to everyone in the workspace.
          </p>

          <div class="floating-label-spacing-lab__item floating-label-spacing-lab__actions">
            <Button variant="text">Cancel</Button>
            <Button variant="filled">Save settings</Button>
          </div>
        </div>
      </section>
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

.floating-label-spacing-lab__previews {
  display: grid;
  gap: 2rem;
}

.floating-label-spacing-lab__preview {
  display: grid;
  gap: 1rem;
}

.floating-label-spacing-lab__preview-heading {
  display: grid;
  gap: 0.25rem;
}

.floating-label-spacing-lab__preview-heading h3,
.floating-label-spacing-lab__preview-heading p,
.floating-label-spacing-lab__notice {
  margin: 0;
}

.floating-label-spacing-lab__preview-heading h3 {
  color: var(--md-sys-color-on-surface);
  font-size: var(--md-sys-typescale-title-medium-size);
  line-height: var(--md-sys-typescale-title-medium-line-height);
  font-weight: var(--md-sys-typescale-title-medium-weight);
}

.floating-label-spacing-lab__preview-heading p,
.floating-label-spacing-lab__notice {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}

.floating-label-spacing-lab__field {
  inline-size: 100%;
}

.floating-label-spacing-lab__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.floating-label-spacing-lab__stack[data-show-layout-boxes='true'] .floating-label-spacing-lab__item {
  outline: 1px dashed var(--md-sys-color-tertiary);
  background: --translucent(var(--md-sys-color-tertiary), 0.06);
}
</style>
