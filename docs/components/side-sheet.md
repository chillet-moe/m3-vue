---
title: SideSheet
---

<script setup lang="ts">
import { ref } from 'vue';
import { SideSheet } from '@/components/SideSheet';
import { Button } from '@/components/Button';

import SideSheetDefault from '../demos/side-sheet/SideSheetDefault.vue';
import SideSheetDefaultSrc from '../demos/side-sheet/SideSheetDefault.vue?raw';
import SideSheetStart from '../demos/side-sheet/SideSheetStart.vue';
import SideSheetStartSrc from '../demos/side-sheet/SideSheetStart.vue?raw';

const props = ref({
  closeOnBackdrop: true,
  side: 'end',
  width: undefined,
});

const open = ref(false);
</script>

# SideSheet

Side sheets present modal supporting content from the side of the viewport using the native `<dialog>` element. Page scrolling behind the sheet is locked while it is open.

<DemoContainer :viewport="false">
  <Button @click="open = true">Open side sheet</Button>

  <SideSheet class="vp-raw" v-bind="props" v-model:open="open">
    <template #headline>Details</template>
    Side sheets display supplemental content without leaving the current page.
    <template #actions>
      <Button color="text" @click="open = false">Close</Button>
    </template>
  </SideSheet>
</DemoContainer>

<AnatomyTable scope="side-sheet" />

<ApiTable component="SideSheet" v-model="props" />

## Examples

### Default

<DemoContainer :src="SideSheetDefaultSrc" :viewport="false">
  <SideSheetDefault />
</DemoContainer>

### Start Side

<DemoContainer :src="SideSheetStartSrc" :viewport="false">
  <SideSheetStart />
</DemoContainer>
