<script setup lang="ts">
import * as animatableShapes from '@/shapes/animatable';
import * as animatableSmallShapes from '@/shapes/animatableSmall';

type ShapeEntry = {
  name: string;
  path: string;
  viewBox: string;
};

const fullShapePaths = animatableShapes as unknown as Record<string, string>;
const smallShapePaths = animatableSmallShapes as unknown as Record<string, string>;

const fullShapeNames = [
  'pathAnimatableCircle',
  'pathAnimatableSquare',
  'pathAnimatableSlanted',
  'pathAnimatableArch',
  'pathAnimatableFan',
  'pathAnimatableArrow',
  'pathAnimatableSemicircle',
  'pathAnimatableOval',
  'pathAnimatablePill',
  'pathAnimatableTriangle',
  'pathAnimatableDiamond',
  'pathAnimatableClamshell',
  'pathAnimatablePentagon',
  'pathAnimatableGem',
  'pathAnimatableVerySunny',
  'pathAnimatableSunny',
  'pathAnimatableFourSidedCookie',
  'pathAnimatableSixSidedCookie',
  'pathAnimatableSevenSidedCookie',
  'pathAnimatableNineSidedCookie',
  'pathAnimatableTwelveSidedCookie',
  'pathAnimatableGhostish',
  'pathAnimatableFourLeafClover',
  'pathAnimatableEightLeafClover',
  'pathAnimatableBurst',
  'pathAnimatableSoftBurst',
  'pathAnimatableBoom',
  'pathAnimatableSoftBoom',
  'pathAnimatableFlower',
  'pathAnimatablePuffy',
  'pathAnimatablePuffyDiamond',
  'pathAnimatablePixelCircle',
  'pathAnimatablePixelTriangle',
  'pathAnimatableBun',
  'pathAnimatableHeart',
] as const;

const smallShapeNames = [
  'pathAnimatableSmallCircle',
  'pathAnimatableSmallSquare',
  'pathAnimatableSmallSlanted',
  'pathAnimatableSmallArch',
  'pathAnimatableSmallFan',
  'pathAnimatableSmallArrow',
  'pathAnimatableSmallSemicircle',
  'pathAnimatableSmallOval',
  'pathAnimatableSmallPill',
  'pathAnimatableSmallTriangle',
  'pathAnimatableSmallDiamond',
  'pathAnimatableSmallClamshell',
  'pathAnimatableSmallPentagon',
  'pathAnimatableSmallGem',
  'pathAnimatableSmallVerySunny',
  'pathAnimatableSmallSunny',
  'pathAnimatableSmallFourSidedCookie',
  'pathAnimatableSmallSixSidedCookie',
  'pathAnimatableSmallSevenSidedCookie',
  'pathAnimatableSmallNineSidedCookie',
  'pathAnimatableSmallTwelveSidedCookie',
  'pathAnimatableSmallGhostish',
  'pathAnimatableSmallFourLeafClover',
  'pathAnimatableSmallEightLeafClover',
  'pathAnimatableSmallFlower',
  'pathAnimatableSmallPuffy',
  'pathAnimatableSmallPuffyDiamond',
  'pathAnimatableSmallBun',
  'pathAnimatableSmallHeart',
] as const;

const createShapeEntries = (
  names: readonly string[],
  source: Record<string, string>,
  viewBox: string,
): ShapeEntry[] => {
  return names.map((name) => ({
    name,
    path: source[name],
    viewBox,
  }));
};

const fullShapes = createShapeEntries(fullShapeNames, fullShapePaths, '0 0 432 432');
const smallShapes = createShapeEntries(smallShapeNames, smallShapePaths, '0 0 48 48');
</script>

<template>
  <div class="material-shape-paths-preview">
    <section class="material-shape-paths-section">
      <h2 class="material-shape-paths-heading">Animatable</h2>
      <div class="material-shape-paths-grid">
        <figure v-for="shape in fullShapes" :key="shape.name" class="material-shape-paths-card">
          <div class="material-shape-paths-canvas">
            <svg :viewBox="shape.viewBox" aria-hidden="true" focusable="false">
              <path :d="shape.path" />
            </svg>
          </div>
          <figcaption>{{ shape.name }}</figcaption>
        </figure>
      </div>
    </section>

    <section class="material-shape-paths-section">
      <h2 class="material-shape-paths-heading">Animatable Small</h2>
      <div class="material-shape-paths-grid">
        <figure v-for="shape in smallShapes" :key="shape.name" class="material-shape-paths-card">
          <div class="material-shape-paths-canvas">
            <svg :viewBox="shape.viewBox" aria-hidden="true" focusable="false">
              <path :d="shape.path" />
            </svg>
          </div>
          <figcaption>{{ shape.name }}</figcaption>
        </figure>
      </div>
    </section>
  </div>
</template>

<style scoped>
.material-shape-paths-preview {
  display: grid;
  gap: 2rem;
}

.material-shape-paths-section {
  display: grid;
  gap: 0.75rem;
}

.material-shape-paths-heading {
  margin: 0;
  color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-title-medium);
}

.material-shape-paths-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 0.75rem;
}

.material-shape-paths-card {
  display: grid;
  gap: 0.625rem;
  margin: 0;
  padding: 0.75rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 0.5rem;
  background: var(--md-sys-color-surface-container-lowest);
}

.material-shape-paths-canvas {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-primary);
}

.material-shape-paths-canvas svg {
  display: block;
  inline-size: 72%;
  block-size: 72%;
  overflow: visible;
}

.material-shape-paths-canvas path {
  fill: currentColor;
}

.material-shape-paths-card figcaption {
  color: var(--md-sys-color-on-surface);
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  line-height: 1.25;
  overflow-wrap: anywhere;
}
</style>
