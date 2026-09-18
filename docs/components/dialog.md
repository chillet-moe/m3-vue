---
title: Dialog
---

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';

import DialogDefault from '../demos/dialog/DialogDefault.vue';
import DialogDefaultSrc from '../demos/dialog/DialogDefault.vue?raw';
import DialogWithIcon from '../demos/dialog/DialogWithIcon.vue';
import DialogWithIconSrc from '../demos/dialog/DialogWithIcon.vue?raw';

const props = ref({
  closeOnBackdrop: true,
  width: undefined,
});

const open = ref(false);
</script>

# Dialog

Dialog provides a modal surface with headline, body, icon, and action slots built on the native `<dialog>` element.

Dialog actions use text buttons, including the primary, confirmation, final, and destructive actions. Express their
hierarchy through clear labels, order, and position rather than filled, tonal, or outlined containers.

<DemoContainer :viewport="false">
  <Button @click="open = true">Open dialog</Button>

  <Dialog class="vp-raw" v-bind="props" v-model:open="open">
    <template #headline>Delete file?</template>
    The file will be permanently removed from your workspace.
    <template #actions>
      <Button variant="text" @click="open = false">Cancel</Button>
      <Button variant="text" @click="open = false">Delete</Button>
    </template>
  </Dialog>
</DemoContainer>

<AnatomyTable scope="dialog" />

<ApiTable component="Dialog" v-model="props" />

<StyleTokenTable component="Dialog" />

## Close lifecycle

`update:open(false)` and `close` are emitted when the native dialog closes. Use them to update application state that
controls whether the dialog is open. `closed` is emitted later, after the Dialog-owned visual exit—including its
backdrop—has finished, with the same native dialog return value as `close`. It does not wait for animations inside slot
content. With no motion or reduced motion, `closed` follows asynchronously without waiting for a timeout.

Keep slot data available during the exit and release it from `closed`:

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue';

const open = ref(false);
const selectedItem = shallowRef<{ name: string } | null>(null);

function requestClose() {
  open.value = false;
}

function clearDialogContent() {
  selectedItem.value = null;
}
</script>

<template>
  <Dialog v-model:open="open" @closed="clearDialogContent">
    <template #headline>{{ selectedItem?.name }}</template>
    <Button variant="text" @click="requestClose">Close</Button>
  </Dialog>
</template>
```

## Width

Use the `width` prop for the dialog surface width.

```vue
<Dialog width="28rem" />
```

For stylesheet-level customization, set `--md-dialog-container-width` on the `Dialog` root. The root native `<dialog>` remains fullscreen so backdrop clicks and modal positioning keep working, while the token controls the inner surface.

```vue
<Dialog class="wide-dialog" />
```

```css
.wide-dialog {
  --md-dialog-container-width: 40rem;
}
```

## Scrollable content

The content part preserves common descendant visual overflow at its block edges while remaining independently
scrollable. See [Scrollable Content Visual Overflow](/guides/scrollable-content-visual-overflow) for the shared Dialog
and sheet contract and its customization token.

## Examples

### Default

<DemoContainer :src="DialogDefaultSrc" :viewport="false">
  <DialogDefault />
</DemoContainer>

### With Icon

<DemoContainer :src="DialogWithIconSrc" :viewport="false">
  <DialogWithIcon />
</DemoContainer>
