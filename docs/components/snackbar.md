---
title: Snackbar
---

<script setup lang="ts">
import { ref } from 'vue';
import { Snackbar } from '@/components/Snackbar';

import SnackbarDefault from '../demos/snackbar/SnackbarDefault.vue';
import SnackbarDefaultSrc from '../demos/snackbar/SnackbarDefault.vue?raw';
import SnackbarOptions from '../demos/snackbar/SnackbarOptions.vue';
import SnackbarOptionsSrc from '../demos/snackbar/SnackbarOptions.vue?raw';
import SnackbarCombinations from '../demos/snackbar/SnackbarCombinations.vue';
import SnackbarCombinationsSrc from '../demos/snackbar/SnackbarCombinations.vue?raw';

const props = ref({
  actionLabel: 'Undo',
  actionDisabled: false,
  actionAutofocus: false,
  actionOnNewLine: false,
  dismissible: true,
  dismissButtonLabel: 'Dismiss notification',
});

const lastEvent = ref('');
</script>

# Snackbar

Snackbar presents transient status updates with optional action and dismiss affordances built from the same button primitives as the library.

## Demo

### Interactive

<DemoContainer :viewport="false">
  <div style="display: flex; flex-direction: column; gap: 1rem; inline-size: min(36rem, 100%);">
    <Snackbar v-bind="props" @action="lastEvent = 'action'" @dismiss="lastEvent = 'dismiss'">
      Message archived
    </Snackbar>
    <div v-if="lastEvent">Last event: {{ lastEvent }}</div>
  </div>
</DemoContainer>

<ApiTable component="Snackbar" v-model="props" />

### Default

<DemoContainer :src="SnackbarDefaultSrc" :viewport="false">
  <SnackbarDefault />
</DemoContainer>

### Options

<DemoContainer :src="SnackbarOptionsSrc" :viewport="false">
  <SnackbarOptions />
</DemoContainer>

### Combinations

<DemoContainer :src="SnackbarCombinationsSrc" :viewport="false">
  <SnackbarCombinations />
</DemoContainer>
