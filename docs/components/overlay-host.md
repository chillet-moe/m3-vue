---
title: OverlayHost
---

# OverlayHost

`OverlayHost` owns the Vue rendering boundary for programmatic dialogs and snackbars.

## When It Is Required

Render exactly one host when the application uses either of these functions:

- `showDialog()`
- `showSnackbar()`

The host is not required for `Dialog` or `Snackbar` instances declared directly in a component template.

`M3VuePlugin` registers the library directives and state layer, but it does not insert `OverlayHost` into the
application's component tree. Add the host explicitly near the application root:

```vue
<script setup lang="ts">
import { OverlayHost } from '@chillet/m3-vue';
</script>

<template>
  <OverlayHost />
  <!-- Your application content -->
</template>
```

Putting the host before application content also makes it available to descendant mounted hooks that may open an
overlay during application startup.

### Nuxt

When using the Nuxt module, add the auto-imported host to `app.vue`:

```vue
<template>
  <OverlayHost />
  <NuxtPage />
</template>
```

## Rendering And Context

The host uses `display: contents`, so it does not add a layout box. Dialog and popover elements remain descendants of
the consuming Vue application and inherit its provides and CSS custom properties. Their native browser APIs place
them in the top layer; `OverlayHost` does not use `Teleport`.

Only one host can be mounted at a time. Calls to `showDialog()` and `showSnackbar()` reject when the host is missing.
Pending programmatic calls reject if that host is unmounted.

<AnatomyTable scope="overlay-host" />

<ApiTable component="OverlayHost" />
