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
    action: {
      label: 'Undo',
      value: 'undo',
    },
  });
}
</script>

# showSnackbar

`showSnackbar()` is the programmatic entry point for transient notifications. It renders a snackbar into the shared
stack owned by the application's [`OverlayHost`](/components/overlay-host), waits for it to close, and resolves with
the outcome.

<DemoContainer :viewport="false">
  <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; padding-block: 2rem;">
    <Button @click="openSnackbar">Open snackbar</Button>
    <div v-if="result">Result: {{ result }}</div>
  </div>
</DemoContainer>

## Prerequisite

Render one `OverlayHost` near the application root before using this function. The host is only required for
programmatic overlays; declarative `Snackbar` instances do not need it. See
[`OverlayHost`](/components/overlay-host) for Vue and Nuxt setup.

## Basic Usage

```ts
import { showSnackbar } from '@chillet/m3-vue';

await showSnackbar({
  message: 'Saved',
});
```

## Configure Defaults

Set application-level defaults when installing `M3VuePlugin`. These defaults apply to future `showSnackbar()` calls.
Refs and getters are supported, and options passed to an individual call always take precedence.

```ts
import { M3VuePlugin } from '@chillet/m3-vue';

app.use(M3VuePlugin, {
  snackbarDefaults: {
    dismissible: false,
    duration: 6_000,
    position: 'bottom-end',
  },
});
```

### Component Subtree Defaults

Call `provideSnackbarDefaults()` in an ancestor and capture the nearest defaults with `useSnackbar()` in descendant
components. The returned function can be used later in event handlers. The globally imported `showSnackbar()` keeps
using application-level defaults because it has no component injection context.

```vue
<!-- NotificationArea.vue -->
<script setup lang="ts">
import { provideSnackbarDefaults } from '@chillet/m3-vue';

provideSnackbarDefaults({
  dismissible: false,
  position: 'top-end',
});
</script>

<template>
  <slot />
</template>
```

```vue
<!-- DescendantComponent.vue -->
<script setup lang="ts">
import { useSnackbar } from '@chillet/m3-vue';

const showSnackbar = useSnackbar();

function notify() {
  void showSnackbar({ message: 'Saved' });
}
</script>
```

The precedence order is built-in defaults, application plugin defaults, the nearest subtree defaults, and finally
the options passed to the individual call.

## Return Value

The promise resolves when the snackbar closes.

- Action click resolves to `action.value`, or `'action'` by default.
- Dismiss button resolves to `dismissValue`, or `'dismiss'` by default.
- Auto timeout resolves to `timeoutValue`, or `'timeout'` by default.

The promise rejects if the function is called outside a browser environment, if `OverlayHost` is not mounted, or if
`action.onClick` throws or rejects.

## Options

The tables below are generated from source types and stay in sync with API changes.

### ShowSnackbarOptions

<SourceApiTable api="showSnackbar" type="ShowSnackbarOptions" :show-signature="false" />

### ShowSnackbarDefaults

<SourceApiTable api="showSnackbar" type="ShowSnackbarDefaults" :show-signature="false" />

### SnackbarAction

<SourceApiTable api="showSnackbar" type="SnackbarAction" :show-signature="false" />

## Behavior Notes

- Programmatic snackbars include a dismiss button by default. Set `dismissible: false` to hide it.
- Multiple snackbars can be shown at the same time.
- Stacks are separated by `position`, so top and bottom placements do not interfere with each other.
- Snackbar actions inherit application-level provides and CSS custom properties from `OverlayHost`.
- Hovering or focusing the snackbar pauses the auto-close timer.
- Leaving the snackbar resumes the remaining time instead of restarting the full duration.

For manually rendered snackbars, see [Snackbar](/components/snackbar).
