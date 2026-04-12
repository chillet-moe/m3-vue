---
title: showDialog
---

<script setup lang="ts">
import ShowDialogDefault from '../demos/show-dialog/ShowDialogDefault.vue';
import ShowDialogDefaultSrc from '../demos/show-dialog/ShowDialogDefault.vue?raw';
</script>

# showDialog

`showDialog()` is the programmatic entry point for modal dialogs. It mounts a temporary `Dialog` instance, waits for it to close, and resolves with the dialog result.

<DemoContainer :src="ShowDialogDefaultSrc" :viewport="false"><ShowDialogDefault /></DemoContainer>

## Basic Usage

```ts
import { showDialog } from '@chillet/m3-vue';

const result = await showDialog({
  headline: 'Delete file?',
  content: 'This action cannot be undone.',
  actions: [
    { label: 'Cancel', value: 'cancel' },
    { label: 'Delete', value: 'confirm' },
  ],
});
```

The promise resolves to the clicked action value. If no explicit `value` is provided, the action label is used instead.

## Options

The tables below are generated from source types and stay in sync with API changes.

### ShowDialogOptions

<SourceApiTable api="showDialog" type="ShowDialogOptions" :show-signature="false" />

### DialogAction

<SourceApiTable api="showDialog" type="DialogAction" :show-signature="false" />

## Behavior Notes

- Calling `showDialog()` outside a browser environment rejects the promise.
- If an action callback throws or rejects, the promise rejects with that error.
- Cleanup waits for the dialog exit animation before unmounting the temporary app host.

For manually rendered dialogs and slot-based composition, see [Dialog](/components/dialog).
