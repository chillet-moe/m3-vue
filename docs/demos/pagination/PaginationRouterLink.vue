<script setup lang="ts">
import { computed, defineComponent, ref } from 'vue';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/Pagination';

const pages = [
  { label: '1', to: '/docs/page/1' },
  { label: '2', to: '/docs/page/2' },
  { label: '3', to: '/docs/page/3' },
] as const;

const currentPath = ref('/docs/page/2');

const currentIndex = computed(() => {
  const index = pages.findIndex((page) => page.to === currentPath.value);
  return index < 0 ? 0 : index;
});

const previousTo = computed(() => pages[Math.max(0, currentIndex.value - 1)]!.to);
const nextTo = computed(() => pages[Math.min(pages.length - 1, currentIndex.value + 1)]!.to);

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
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <DemoRouterLink custom :to="previousTo" v-slot="{ href, navigate }">
            <PaginationPrevious :href="href" :disabled="currentIndex === 0" @click="navigate" />
          </DemoRouterLink>
        </PaginationItem>

        <PaginationItem v-for="page in pages" :key="page.to">
          <DemoRouterLink custom :to="page.to" v-slot="{ href, navigate, isActive }">
            <PaginationLink :href="href" :is-active="isActive" @click="navigate">{{ page.label }}</PaginationLink>
          </DemoRouterLink>
        </PaginationItem>

        <PaginationItem>
          <DemoRouterLink custom :to="nextTo" v-slot="{ href, navigate }">
            <PaginationNext :href="href" :disabled="currentIndex === pages.length - 1" @click="navigate" />
          </DemoRouterLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>

    <div>Current route: {{ currentPath }}</div>
  </div>
</template>
