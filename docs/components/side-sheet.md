---
title: SideSheet
---

<script setup lang="ts">
import { ref } from 'vue';
import { SideSheet } from '@/components/SideSheet';
import { Button } from '@/components/Button';

import SideSheetDefault from '../demos/side-sheet/SideSheetDefault.vue';
import SideSheetDefaultSrc from '../demos/side-sheet/SideSheetDefault.vue?raw';
import SideSheetDetached from '../demos/side-sheet/SideSheetDetached.vue';
import SideSheetDetachedSrc from '../demos/side-sheet/SideSheetDetached.vue?raw';
import SideSheetStart from '../demos/side-sheet/SideSheetStart.vue';
import SideSheetStartSrc from '../demos/side-sheet/SideSheetStart.vue?raw';

const props = ref({
  closeOnBackdrop: true,
  lockScroll: true,
  side: 'end',
  variant: 'docked',
  width: undefined,
});

const open = ref(false);
</script>

# SideSheet

Side sheets present modal supporting content from the side of the viewport using the native `<dialog>` element. Page scrolling behind the sheet is locked by default while it is open.

<DemoContainer :viewport="false">
  <Button @click="open = true">Open side sheet</Button>

  <SideSheet class="vp-raw" v-bind="props" v-model:open="open">
    <template #headline>Details</template>
    Side sheets display supplemental content without leaving the current page.
    <template #actions>
      <Button variant="text" @click="open = false">Close</Button>
    </template>
  </SideSheet>
</DemoContainer>

<AnatomyTable scope="side-sheet" />

<ApiTable component="SideSheet" v-model="props" />

<StyleTokenTable component="SideSheet" />

## Close lifecycle

`update:open(false)` and `close` run when the native dialog closes. Use `closed` for cleanup that must wait until the
sheet is no longer visible. It is emitted after the SideSheet-owned exit motion, including its backdrop, finishes and
receives the same native dialog return value as `close`. It does not wait for animations inside slot content. With no
motion or reduced motion, it follows asynchronously without a business timeout.

```vue
<SideSheet v-model:open="open" @closed="selectedItem = null">
  {{ selectedItem?.name }}
  <template #actions>
    <Button variant="text" @click="open = false">Close</Button>
  </template>
</SideSheet>
```

Keep content or payload state intact in `close` and while setting `open` to `false`; clear it from `closed`.

## Layout

The dialog root owns viewport placement and motion. The sheet surface owns the background, shape, and elevation.
Default spacing is applied to the `headline`, `content`, and `actions` parts instead of the surface, so custom
full-bleed content can opt out by overriding the relevant part padding.

Scrollable content also preserves common descendant visual overflow at its block edges. See
[Scrollable Content Visual Overflow](/guides/scrollable-content-visual-overflow) for the shared surface contract and
its customization token.

## Examples

### Default

<DemoContainer :src="SideSheetDefaultSrc" :viewport="false">
  <SideSheetDefault />
</DemoContainer>

### Start Side

<DemoContainer :src="SideSheetStartSrc" :viewport="false">
  <SideSheetStart />
</DemoContainer>

### Detached

<DemoContainer :src="SideSheetDetachedSrc" :viewport="false">
  <SideSheetDetached />
</DemoContainer>
