<script setup lang="ts">
import BoundaryChild from './BoundaryChild.vue';

defineProps<{
  dynamicClass: unknown;
}>();
</script>

<template>
  <section id="owned">
    <span id="owned-content">Owned</span>
    <button id="owned-button" class="explicit">Owned button</button>
    <BoundaryChild id="plain" role="button" />
    <BoundaryChild id="explicit" class="explicit" />
    <BoundaryChild id="coincident" />
    <BoundaryChild id="dynamic" :class="dynamicClass" />
  </section>
</template>

<style scoped>
button {
  --type-leak: yes;
}

button.explicit {
  --type-class-leak: yes;
}

#plain {
  --id-leak: yes;
}

[role='button'] {
  --attribute-leak: yes;
}

.coincident {
  --class-leak: yes;
}

.explicit {
  --explicit: yes;
}

.dynamic.active {
  --dynamic: yes;
}

.next.ready {
  --next: yes;
}
</style>
