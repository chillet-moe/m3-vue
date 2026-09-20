<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CheckBox } from '@/components/CheckBox';
import { IconButton } from '@/components/IconButton';
import { Slider } from '@/components/Slider';
import { Switch } from '@/components/Switch';
import { TextField } from '@/components/TextField';

const defaultActions = ref(0);
const desktopActions = ref(0);
const checked = ref(true);
const enabled = ref(false);
const volume = ref(40);
</script>

<template>
  <div class="cursor-demo">
    <section class="cursor-demo__policy" aria-labelledby="web-cursor-policy">
      <h3 id="web-cursor-policy">Default web policy</h3>
      <div class="cursor-demo__actions">
        <Button @click="defaultActions++">Action · {{ defaultActions }}</Button>
        <IconButton icon="refresh" aria-label="Refresh" @click="defaultActions++" />
        <Button href="#cursor-exceptions">URL link</Button>
      </div>
      <Card class="cursor-demo__card" clickable @click="defaultActions++">Clickable card</Card>
    </section>

    <section class="cursor-demo__policy cursor-demo__policy--desktop" aria-labelledby="desktop-cursor-policy">
      <h3 id="desktop-cursor-policy">Desktop-style policy</h3>
      <div class="cursor-demo__actions">
        <Button @click="desktopActions++">Action · {{ desktopActions }}</Button>
        <IconButton icon="refresh" aria-label="Refresh" @click="desktopActions++" />
        <Button href="#cursor-exceptions">URL link</Button>
      </div>
      <Card class="cursor-demo__card" clickable @click="desktopActions++">Clickable card</Card>
    </section>

    <section id="cursor-exceptions" class="cursor-demo__exceptions" aria-labelledby="cursor-exceptions-title">
      <h3 id="cursor-exceptions-title">Unaffected cursor semantics</h3>
      <div class="cursor-demo__controls">
        <CheckBox v-model:checked="checked">Action control</CheckBox>
        <Switch v-model:checked="enabled">Action control</Switch>
        <Slider v-model:value="volume" :min="0" :max="100" :step="1" aria-label="Volume" />
        <TextField label="Text input" model-value="Text keeps its insertion cursor" />
        <a href="#web-cursor-policy">Native URL link</a>
        <div class="cursor-demo__draggable" draggable="true">Drag handle</div>
        <textarea aria-label="Resizable notes" value="Resize from the corner"></textarea>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cursor-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  gap: 1rem;
}

.cursor-demo__policy,
.cursor-demo__exceptions {
  display: grid;
  align-content: start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-shape-card);
  background: var(--md-sys-color-surface-container-low);
}

.cursor-demo__policy--desktop {
  --md-cursor-action: default;
}

.cursor-demo__policy h3,
.cursor-demo__exceptions h3 {
  margin: 0;
  color: var(--md-sys-color-on-surface);
  font: var(--md-sys-typescale-title-medium);
}

.cursor-demo__actions,
.cursor-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.cursor-demo__card {
  padding: 1rem;
}

.cursor-demo__exceptions {
  grid-column: 1 / -1;
}

.cursor-demo__controls > * {
  flex: 1 1 12rem;
}

.cursor-demo__draggable {
  padding: 0.75rem;
  border: 1px dashed var(--md-sys-color-outline);
  border-radius: var(--md-shape-compact);
  cursor: grab;
  user-select: none;
}

.cursor-demo__draggable:active {
  cursor: grabbing;
}

.cursor-demo textarea {
  min-block-size: 4rem;
  padding: 0.75rem;
  resize: both;
  cursor: text;
}
</style>
