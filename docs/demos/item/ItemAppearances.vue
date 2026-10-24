<script setup lang="ts">
import { ref } from 'vue';
import { ListItem } from '@/components/ListItem';
const active = ref(0);
</script>
<template>
  <div class="item-appearances">
    <section v-for="appearance in ['standard', 'expressive'] as const" :key="appearance">
      <h3>{{ appearance }}</h3>
      <ListItem
        v-for="(title, index) in ['General', 'Appearance', 'Shortcuts']"
        :key="title"
        :appearance="appearance"
        :title="title"
        :active="active === index"
        @click="active = index"
      />
    </section>
  </div>
</template>
<style scoped>
.item-appearances {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
</style>
