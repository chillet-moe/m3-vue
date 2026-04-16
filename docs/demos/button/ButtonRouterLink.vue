<script setup lang="ts">
import { defineComponent, ref } from 'vue';
import { Button } from '@/components/Button';

const currentPath = ref('/inbox');

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
      <DemoRouterLink custom to="/inbox" v-slot="{ href, navigate, isActive }">
        <Button :href="href" :color="isActive ? 'filled' : 'outlined'" @click="navigate">Inbox</Button>
      </DemoRouterLink>

      <DemoRouterLink custom to="/archive" v-slot="{ href, navigate, isActive }">
        <Button :href="href" :color="isActive ? 'filled' : 'outlined'" @click="navigate">Archive</Button>
      </DemoRouterLink>
    </div>

    <div>Current route: {{ currentPath }}</div>
  </div>
</template>
