---
title: showSnackbar
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { showSnackbar } from '@/components/Snackbar';

const result = ref('');

async function openSnackbar() {
  result.value = await showSnackbar({
    message: 'Draft archived',
    dismissible: true,
    action: {
      label: 'Undo',
      value: 'undo',
    },
  });
}
</script>

# showSnackbar

`showSnackbar()` is the programmatic entry point for transient notifications. It renders a snackbar into the shared stack, waits for it to close, and resolves with the outcome.

<DemoContainer :viewport="false">
  <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; padding-block: 2rem;">
    <Button @click="openSnackbar">Open snackbar</Button>
    <div v-if="result">Result: {{ result }}</div>
  </div>
</DemoContainer>

## Basic Usage

```ts
import { showSnackbar } from '@chillet/m3-vue';

await showSnackbar({
  message: 'Saved',
});
```

## Return Value

The promise resolves when the snackbar closes.

- Action click resolves to `action.value`, or `'action'` by default.
- Dismiss button resolves to `dismissValue`, or `'dismiss'` by default.
- Auto timeout resolves to `timeoutValue`, or `'timeout'` by default.

The promise rejects if the function is called outside a browser environment, or if `action.onClick` throws or rejects.

## Options

The tables below are generated from source types and stay in sync with API changes.

### ShowSnackbarOptions

<SourceApiTable api="showSnackbar" type="ShowSnackbarOptions" :show-signature="false" />

### SnackbarAction

<SourceApiTable api="showSnackbar" type="SnackbarAction" :show-signature="false" />

## Behavior Notes

- Multiple snackbars can be shown at the same time.
- Stacks are separated by `position`, so top and bottom placements do not interfere with each other.
- Hovering or focusing the snackbar pauses the auto-close timer.
- Leaving the snackbar resumes the remaining time instead of restarting the full duration.

For manually rendered snackbars, see [Snackbar](/components/snackbar).
