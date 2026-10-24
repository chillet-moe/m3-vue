---
title: Skeleton
---

<script setup lang="ts">
import { ref } from 'vue';
import { Skeleton } from '@/components/Skeleton';

import SkeletonDefault from '../demos/skeleton/SkeletonDefault.vue';
import SkeletonDefaultSrc from '../demos/skeleton/SkeletonDefault.vue?raw';
import SkeletonShapes from '../demos/skeleton/SkeletonShapes.vue';
import SkeletonShapesSrc from '../demos/skeleton/SkeletonShapes.vue?raw';
import SkeletonAnimations from '../demos/skeleton/SkeletonAnimations.vue';
import SkeletonAnimationsSrc from '../demos/skeleton/SkeletonAnimations.vue?raw';

const props = ref({
  as: 'div',
  animation: 'wave',
});
</script>

# Skeleton

Skeleton renders a decorative loading placeholder. It intentionally does not prescribe shape: set size, layout, and border radius with class or inline styles.

<DemoContainer :viewport="false">
  <div class="docs-skeleton-preview">
    <Skeleton v-bind="props" class="docs-skeleton-avatar" />
    <div class="docs-skeleton-lines">
      <Skeleton v-bind="props" class="docs-skeleton-line docs-skeleton-line-strong" />
      <Skeleton v-bind="props" class="docs-skeleton-line" />
      <Skeleton v-bind="props" class="docs-skeleton-line docs-skeleton-line-short" />
    </div>
  </div>
</DemoContainer>

## Examples

### Default

<DemoContainer :src="SkeletonDefaultSrc" :viewport="false">
  <SkeletonDefault />
</DemoContainer>

### Shapes

<DemoContainer :src="SkeletonShapesSrc" :viewport="false">
  <SkeletonShapes />
</DemoContainer>

### Animations

<DemoContainer :src="SkeletonAnimationsSrc" :viewport="false">
  <SkeletonAnimations />
</DemoContainer>

<style>
.docs-skeleton-preview {
  display: grid;
  grid-template-columns: auto minmax(12rem, 22rem);
  align-items: center;
  gap: 1rem;
}

.docs-skeleton-avatar {
  inline-size: 4rem;
  block-size: 4rem;
  border-radius: var(--md-sys-shape-corner-full);
}

.docs-skeleton-lines {
  display: grid;
  gap: 0.625rem;
}

.docs-skeleton-line {
  block-size: 0.875rem;
  border-radius: var(--md-sys-shape-corner-full);
}

.docs-skeleton-line-strong {
  block-size: 1.125rem;
}

.docs-skeleton-line-short {
  inline-size: 68%;
}
</style>

## Reference

<AnatomyTable scope="skeleton" />

<ApiTable component="Skeleton" v-model="props" />

<StyleTokenTable component="Skeleton" />
