---
title: showDialog
---

<script setup lang="ts">
import ShowDialogDefault from '../demos/show-dialog/ShowDialogDefault.vue';
import ShowDialogDefaultSrc from '../demos/show-dialog/ShowDialogDefault.vue?raw';
</script>

# showDialog

`showDialog()` is the programmatic entry point for modal dialogs. It renders a `Dialog` through the application's
[`OverlayHost`](/components/overlay-host), waits for it to close, and resolves with the dialog result.

<DemoContainer :src="ShowDialogDefaultSrc" :viewport="false"><ShowDialogDefault /></DemoContainer>

## Prerequisite

Render one `OverlayHost` near the application root before using this function. The host is only required for
programmatic overlays; declarative `Dialog` instances do not need it. See
[`OverlayHost`](/components/overlay-host) for Vue and Nuxt setup.

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
- Calling `showDialog()` without a mounted `OverlayHost` rejects the promise.
- The dialog inherits application-level provides and CSS custom properties from the host.
- If an action callback throws or rejects, the promise rejects with that error.
- Cleanup waits for the dialog exit animation before removing it from the host.

For manually rendered dialogs and slot-based composition, see [Dialog](/components/dialog).
