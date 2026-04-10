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
});

const open = ref(false);
</script>

# Dialog

Dialog provides a modal surface with headline, body, icon, and action slots built on the native `<dialog>` element.

## Demo

### Interactive

<DemoContainer :viewport="false">
  <Button @click="open = true">Open dialog</Button>

  <Dialog v-bind="props" v-model:open="open">
    <template #headline>Delete file?</template>
    The file will be permanently removed from your workspace.

    <template #actions>
      <Button color="text" @click="open = false">Cancel</Button>
      <Button color="text" @click="open = false">Delete</Button>
    </template>
  </Dialog>
</DemoContainer>

<ApiTable component="Dialog" v-model="props" />

### Default

<DemoContainer :src="DialogDefaultSrc" :viewport="false">
  <DialogDefault />
</DemoContainer>

### With Icon

<DemoContainer :src="DialogWithIconSrc" :viewport="false">
  <DialogWithIcon />
</DemoContainer>
