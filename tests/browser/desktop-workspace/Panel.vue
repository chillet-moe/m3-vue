<script setup lang="ts">
import SliderPreciseValue from '../../../docs/demos/slider/SliderPreciseValue.vue';
import SelectVirtual from '../../../docs/demos/select/SelectVirtual.vue';
import ComboboxAsync from '../../../docs/demos/combobox/ComboboxAsync.vue';
import CheckBoxGroup from '../../../docs/demos/checkbox/CheckBoxGroup.vue';
import { Select } from '@/components/Select';
import { ListItem } from '@/components/ListItem';
</script>
<template>
  <section class="workspace-panel" aria-label="Layer properties">
    <h3>Layer properties</h3>
    <SliderPreciseValue />
    <Select
      label="Blend"
      size="extra-small"
      :options="[
        { label: 'Normal', value: 1 },
        { label: 'Multiply', value: 2 },
      ]"
      :model-value="1"
    />
    <SelectVirtual /><ComboboxAsync /><CheckBoxGroup />
    <ListItem title="Standard item" data-testid="standard-item" active />
    <ListItem title="Expressive item" data-testid="expressive-item" appearance="expressive" active />
  </section>
</template>
<style scoped>
.workspace-panel {
  inline-size: 300px;
  max-inline-size: 100%;
  display: grid;
  gap: 12px;
  padding: 12px;
  box-sizing: border-box;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}
.workspace-panel h3 {
  margin: 0;
  font-size: 16px;
}
</style>
