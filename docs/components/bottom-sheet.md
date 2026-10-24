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
      <Button variant="text" @click="open = false">Cancel</Button>
      <Button variant="text" @click="open = false">Copy link</Button>
    </template>
  </BottomSheet>
</DemoContainer>

## Close lifecycle

`update:open(false)` and `close` run when the native dialog closes. Use `closed` for cleanup that must wait until the
sheet is no longer visible. It is emitted after the BottomSheet-owned exit motion, including its backdrop, finishes and
receives the same native dialog return value as `close`. It does not wait for animations inside slot content. With no
motion or reduced motion, it follows asynchronously without a business timeout.

```vue
<BottomSheet v-model:open="open" @closed="selectedItem = null">
  {{ selectedItem?.name }}
  <template #actions>
    <Button variant="text" @click="open = false">Close</Button>
  </template>
</BottomSheet>
```

Keep content or payload state intact in `close` and while setting `open` to `false`; clear it from `closed`.

## Layout

The sheet surface owns the background, shape, elevation, and motion. Default spacing is applied to the `headline`, `content`, and `actions` parts instead of the surface, so custom full-bleed content can opt out by overriding the relevant part padding.

Scrollable content also preserves common descendant visual overflow at its block edges. See
[Scrollable Content Visual Overflow](/guides/scrollable-content-visual-overflow) for the shared surface contract and
its customization token.

## Examples

### Default

<DemoContainer :src="BottomSheetDefaultSrc" :viewport="false">
  <BottomSheetDefault />
</DemoContainer>

### No Handle

<DemoContainer :src="BottomSheetNoHandleSrc" :viewport="false">
  <BottomSheetNoHandle />
</DemoContainer>

## Reference

<AnatomyTable scope="bottom-sheet" />

<ApiTable component="BottomSheet" v-model="props" />

<StyleTokenTable component="BottomSheet" />
