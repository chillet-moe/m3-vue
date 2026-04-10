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

## Demo

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

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `message` | `string` | `''` | Snackbar text content |
| `action` | `SnackbarAction` | - | Optional action button |
| `duration` | `number \| null` | `4000` | Auto-close delay in milliseconds, or `null` to disable it |
| `timeoutValue` | `string` | `'timeout'` | Value resolved on auto close |
| `dismissValue` | `string` | `'dismiss'` | Value resolved on dismiss button click |
| `position` | `'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end'` | `'bottom'` | Snackbar stack placement |
| `actionOnNewLine` | `boolean` | `false` | Passed through to the `Snackbar` component |
| `dismissible` | `boolean` | `false` | Shows the dismiss button |
| `dismissButtonLabel` | `string` | `'Dismiss notification'` | Accessible label for the dismiss button |

`SnackbarAction` fields:

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | - | Visible label |
| `value` | `string` | `'action'` | Resolution value when the action closes the snackbar |
| `disabled` | `boolean` | `false` | Disables the action button |
| `autofocus` | `boolean` | `false` | Autofocuses the action button |
| `closeOnClick` | `boolean` | `true` | Keep the snackbar open by setting this to `false` |
| `onClick` | `() => void \| boolean \| Promise<void \| boolean>` | - | Return `false` to keep the snackbar open |

## Behavior Notes

- Multiple snackbars can be shown at the same time.
- Stacks are separated by `position`, so top and bottom placements do not interfere with each other.
- Hovering or focusing the snackbar pauses the auto-close timer.
- Leaving the snackbar resumes the remaining time instead of restarting the full duration.

For manually rendered snackbars, see [Snackbar](/components/snackbar).
