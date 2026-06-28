<script setup lang="ts">
import { useRouter } from 'vitepress';
import { Breadcrumb, type BreadcrumbItem } from '@/components/Breadcrumb';

const router = useRouter();

const items = [
  { label: 'Components', href: '/components/button' },
  { label: 'Navigation', href: '/components/pagination' },
  { label: 'Breadcrumb' },
];

function navigate(event: MouseEvent, item: BreadcrumbItem) {
  if (!item.href) {
    return;
  }

  event.preventDefault();
  router.go(item.href);
}
</script>

<template>
  <Breadcrumb :items="items" @item-click="navigate" />
</template>
