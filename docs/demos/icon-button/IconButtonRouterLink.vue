<script setup lang="ts">
import { defineComponent, ref } from 'vue';
import { IconButton } from '@/components/IconButton';

const currentPath = ref('/search');

const DemoRouterLink = defineComponent({
  name: 'DemoRouterLink',
  props: {
    to: {
      type: String,
      required: true,
    },
    custom: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const navigate = (event?: Event) => {
      event?.preventDefault();
      currentPath.value = props.to;
    };

    return () =>
      slots.default?.({
        href: props.to,
        navigate,
        isActive: currentPath.value === props.to,
      });
  },
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start">
    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap">
      <DemoRouterLink custom to="/search" v-slot="{ href, navigate, isActive }">
        <IconButton
          :href="href"
          :variant="isActive ? 'filled' : 'outlined'"
          icon="search"
          aria-label="Search"
          @click="navigate"
        />
      </DemoRouterLink>

      <DemoRouterLink custom to="/favorites" v-slot="{ href, navigate, isActive }">
        <IconButton
          :href="href"
          :variant="isActive ? 'filled' : 'outlined'"
          icon="favorite"
          aria-label="Favorites"
          @click="navigate"
        />
      </DemoRouterLink>
    </div>

    <div>Current route: {{ currentPath }}</div>
  </div>
</template>
