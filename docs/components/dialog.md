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

## Examples

### Default

<DemoContainer :src="DialogDefaultSrc" :viewport="false">
  <DialogDefault />
</DemoContainer>

### With Icon

<DemoContainer :src="DialogWithIconSrc" :viewport="false">
  <DialogWithIcon />
</DemoContainer>
