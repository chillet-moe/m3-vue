---
title: BottomSheet
---

<script setup lang="ts">
import { ref } from 'vue';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';

import BottomSheetDefault from '../demos/bottom-sheet/BottomSheetDefault.vue';
import BottomSheetDefaultSrc from '../demos/bottom-sheet/BottomSheetDefault.vue?raw';
import BottomSheetNoHandle from '../demos/bottom-sheet/BottomSheetNoHandle.vue';
import BottomSheetNoHandleSrc from '../demos/bottom-sheet/BottomSheetNoHandle.vue?raw';

const props = ref({
  closeOnBackdrop: true,
  showDragHandle: true,
  maxHeight: undefined,
});

const open = ref(false);
</script>

# BottomSheet

Bottom sheets present modal content from the bottom edge of the viewport using the native `<dialog>` element. Page scrolling behind the sheet is locked while it is open.

<DemoContainer :viewport="false">
  <Button @click="open = true">Open bottom sheet</Button>

  <BottomSheet class="vp-raw" v-bind="props" v-model:open="open">
    <template #headline>Share</template>
    Choose where this item should be shared.
    <template #actions>
      <Button color="text" @click="open = false">Cancel</Button>
      <Button color="text" @click="open = false">Copy link</Button>
    </template>
  </BottomSheet>
</DemoContainer>

<AnatomyTable scope="bottom-sheet" />

<ApiTable component="BottomSheet" v-model="props" />

## Examples

### Default

<DemoContainer :src="BottomSheetDefaultSrc" :viewport="false">
  <BottomSheetDefault />
</DemoContainer>

### No Handle

<DemoContainer :src="BottomSheetNoHandleSrc" :viewport="false">
  <BottomSheetNoHandle />
</DemoContainer>
