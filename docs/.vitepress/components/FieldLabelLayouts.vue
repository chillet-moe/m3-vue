<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { useData } from 'vitepress';
import { TextField, Select, Combobox } from '@/index';
const { lang } = useData();
const zh = computed(() => lang.value.startsWith('zh'));
const id = useId();
const name = ref('Assembly');
const unit = ref('mm');
const material = ref('aluminum');
const query = ref('');
const length = ref('120');
const units = ['mm', 'cm', 'in'].map((value) => ({ value, label: value }));
const materials = computed(() => [
  { value: 'aluminum', label: zh.value ? '铝' : 'Aluminum' },
  { value: 'steel', label: zh.value ? '钢' : 'Steel' },
]);
</script>

<template>
  <div class="label-layouts vp-raw">
    <section class="label-layout">
      <h3 class="label-layout-title">{{ zh ? '上方标签' : 'Labels above' }}</h3>
      <div class="labels-above">
        <label :for="`${id}-name`">{{ zh ? '名称' : 'Name' }}</label>
        <TextField :id="`${id}-name`" v-model="name" label-behavior="external" />
        <label :for="`${id}-unit`" :id="`${id}-unit-label`">{{ zh ? '单位' : 'Units' }}</label>
        <Select
          :id="`${id}-unit`"
          v-model="unit"
          :options="units"
          label-behavior="external"
          :aria-labelledby="`${id}-unit-label`"
        />
      </div>
    </section>
    <section class="label-layout">
      <h3 class="label-layout-title">{{ zh ? '左侧标签' : 'Labels beside fields' }}</h3>
      <div class="labels-beside">
        <label :for="`${id}-material`" :id="`${id}-material-label`">{{ zh ? '材质' : 'Material' }}</label>
        <Combobox
          :id="`${id}-material`"
          v-model="material"
          :options="materials"
          label-behavior="external"
          :aria-labelledby="`${id}-material-label`"
        />
        <label :for="`${id}-length`">{{ zh ? '长度' : 'Length' }}</label>
        <TextField :id="`${id}-length`" v-model="length" type="number" label-behavior="external"
          ><template #suffix>{{ unit }}</template></TextField
        >
      </div>
    </section>
    <section class="label-layout">
      <h3 class="label-layout-title">{{ zh ? '无可见标签' : 'No visible label' }}</h3>
      <TextField
        v-model="query"
        :label="zh ? '搜索零件' : 'Search parts'"
        :placeholder="zh ? '搜索零件…' : 'Search parts…'"
        label-behavior="external"
      />
    </section>
    <section class="label-layout">
      <h3 class="label-layout-title">{{ zh ? '浮动标签' : 'Floating label' }}</h3>
      <TextField v-model="name" :label="zh ? '名称' : 'Name'" label-behavior="floating" />
    </section>
  </div>
</template>

<style scoped>
.label-layouts {
  display: grid;
  gap: var(--md-field-row-gap);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  margin-block: 1.5rem;
}
.label-layout {
  display: grid;
  align-content: start;
  gap: var(--md-field-row-gap);
  min-inline-size: 0;
}
.label-layout-title {
  margin: 0;
  font: var(--md-sys-typescale-title-medium);
}
.labels-above {
  display: grid;
  gap: 0.375rem;
  font: var(--md-sys-typescale-body-medium);
}
.labels-above label:not(:first-child) {
  margin-block-start: var(--md-field-row-gap);
}
.labels-beside {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  gap: var(--md-field-row-gap) var(--md-field-column-gap);
  font: var(--md-sys-typescale-body-medium);
}
</style>
