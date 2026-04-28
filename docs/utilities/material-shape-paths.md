---
title: Material Shape Paths
---

<script setup lang="ts">
import MaterialShapePathsPreview from '../demos/material-shape-paths/MaterialShapePathsPreview.vue';
import MaterialShapePathsPreviewSrc from '../demos/material-shape-paths/MaterialShapePathsPreview.vue?raw';
</script>

# Material Shape Paths

This package exposes animatable Material shape paths as plain string constants.

The current path data is adapted from KTibow's m3-svelte:

- Full-size source: https://github.com/KTibow/m3-svelte/blob/main/src/lib/misc/shapesAnimatable.ts
- Small source: https://github.com/KTibow/m3-svelte/blob/main/src/lib/misc/shapesAnimatableSmall.ts

The copied data includes all exported full-size and small animatable shape paths from those source files. Each path is kept as an individual named export, rather than a single exported object or array, so unused shapes can be removed by tree shaking.

```ts
import { pathAnimatableSoftBurst, pathAnimatableSmallSunny } from '@chillet/m3-vue';
```

## Preview

<DemoContainer :src="MaterialShapePathsPreviewSrc" :viewport="false"><MaterialShapePathsPreview /></DemoContainer>

LoadingIndicator imports only the seven full-size constants it needs and builds its morph sequence locally.
