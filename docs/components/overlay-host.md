---
title: OverlayHost
---

# OverlayHost

`OverlayHost` renders programmatic dialogs and snackbars inside a specific application or panel. Declarative `Dialog` and `Snackbar` components do not require a host.

## Setup

Create a controller for each independently owned UI host. Pass it to `OverlayHost` and provide it to descendant components:

```vue
<script setup lang="ts">
import { createOverlayHost, provideOverlayHost, OverlayHost } from '@chillet/m3-vue';

const overlays = provideOverlayHost(createOverlayHost());
</script>

<template>
  <OverlayHost :host="overlays" />
  <ApplicationContent />
</template>
```

`provideOverlayHost()` makes the controller available to descendants through `useOverlays()` and `useSnackbar()`. The `OverlayHost` default slot also provides its controller to descendants. When placing the host beside application content, call `provideOverlayHost()` in their common ancestor, as above. For Nuxt, use the same setup in `app.vue` with `NuxtPage` as the content.

```ts
// Inside a descendant's setup:
const { showDialog, showSnackbar } = useOverlays();

// Later, in an event handler:
const result = await showDialog({
  headline: 'Save changes?',
  actions: [{ label: 'Save', value: 'save' }],
});
await showSnackbar({ message: 'Saved' });
```

Call `useOverlays()` during setup, then retain or destructure its functions for event handlers and asynchronous callbacks. Its snackbar function follows the nearest reactive `provideSnackbarDefaults()` configuration. `useSnackbar()` remains available when only notifications are needed.

## Outside Components

Bind once with `createOverlayService(host)`. The returned functions do not depend on `this` or an active Vue component:

```ts
import { createOverlayHost, createOverlayService } from '@chillet/m3-vue';

// Create these for each application or independently owned panel.
const host = createOverlayHost();
const { showDialog, showSnackbar } = createOverlayService(host);

// Render <OverlayHost :host="host" /> before calling either function.
await showDialog({ headline: 'Continue?' });
await showSnackbar({ message: 'Saved' });
```

Pass this service to application services or stores when constructing them. It can be created before mounting, but calls require a mounted host. It uses the host's reactive snackbar defaults rather than a component subtree's overrides. Creating a service does not mount or extend the lifetime of its host.

No active-window lookup is performed. The plugin does not insert a host automatically. The lower-level `showDialog(host, options)` and `showSnackbar(host, options)` exports remain available for explicit one-off calls.

## Ownership And Lifecycle

A controller may be mounted by one `OverlayHost` at a time. Different controllers can coexist in one Document or in different same-origin windows. Each host owns its snackbar defaults and stacks; configuration from another application cannot replace them.

Unmounting a host rejects its pending Dialog and Snackbar promises with an `Error`. Calls made while the host is absent also reject. An action callback that completes after disposal cannot reopen its overlay. Handle rejection when the UI can disappear before an action finishes.

The host uses `display: contents` and inherits Vue provides and CSS custom properties where it is rendered. Native dialog and popover elements enter the browser top layer. The host does not relocate content with `Teleport`.

When a mounted panel moves to another same-origin Document, move its host with it if future programmatic overlays should follow the panel. A controller bound to the application's original host continues to target that original host. See [Multiple windows](/guides/multiple-windows) for lifecycle and browser constraints.

## Migration

Replace `<OverlayHost />` with a controller-bound host as shown above. In descendant components, replace direct function imports with:

```ts
import { useOverlays } from '@chillet/m3-vue';
const { showDialog, showSnackbar } = useOverlays();
```

Existing `showDialog(options)` and `showSnackbar(options)` call bodies can stay unchanged. Outside components, obtain those functions from `createOverlayService(host)` instead. A component that creates and provides its own host should also use `createOverlayService(host)` for its own calls: Vue injection reads ancestors, not the same component's provides.

Do not keep a module-wide controller when multiple applications or independently disposable panels use that module. Create the controller with the owning UI instance.

## Reference

<AnatomyTable scope="overlay-host" />

<ApiTable component="OverlayHost" />
