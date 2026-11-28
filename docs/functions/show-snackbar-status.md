---
title: showSnackbarStatus
---

<script setup lang="ts">
import SnackbarStatusStack from '../demos/snackbar/SnackbarStatusStack.vue';
import SnackbarStatusStackSrc from '../demos/snackbar/SnackbarStatusStack.vue?raw';
</script>

# showSnackbarStatus

Use `showSnackbarStatus(host, options)` to display a non-interactive status while an application condition holds. It shares a native popover with [programmatic snackbars](/functions/show-snackbar) at the same position in the same [OverlayHost](/components/overlay-host).

<DemoContainer :src="SnackbarStatusStackSrc" :viewport="false"><SnackbarStatusStack /></DemoContainer>

Try showing the snackbar first, then enable both statuses in either order. Toggle either status off to let the remaining items move up.

## Bind a status to application state

```ts
import { h, watch } from 'vue';
import { showSnackbarStatus } from '@chillet/m3-vue';

// host is mounted, syncing is a boolean ref, and progress is a number ref.
watch(
  syncing,
  (active, _, onCleanup) => {
    if (!active) return;
    const status = showSnackbarStatus(host, {
      position: 'top-end',
      order: 0,
      render: () => h('span', { role: 'status' }, `Syncing files · ${progress.value}%`),
    });
    onCleanup(status.close);
  },
  { immediate: true },
);
```

`render` can return text, elements, or Vue components. Reading a ref during rendering updates the visible content in place. Supply the appearance and any announcement semantics in the rendered content. Use non-focusable content without actions. Pointer input passes through to the page underneath.

Each call returns its own handle immediately. The status stays visible until `close()` or host unmount. Calling `close()` again is safe, including after another status has opened. Calling the function without a mounted browser host throws synchronously. For a host-bound function, use `useOverlays()` during setup or `createOverlayService(host)`.

## Stack order

Within a position, statuses appear above ordinary snackbars, sorted by ascending `order` (default `0`). Ties and ordinary snackbars each retain their arrival order. At `top-end`, the stack sits 16px from the top and inline-end edges with 8px between items. Wrapped content contributes its full height. Each position and host has its own stack.

## Reference

<SourceApiTable api="showSnackbarStatus" type="ShowSnackbarStatusOptions" />

<SourceApiTable api="showSnackbarStatus" type="SnackbarStatusHandle" :show-signature="false" />
