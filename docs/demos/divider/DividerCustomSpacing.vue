<script setup lang="ts">
import { Divider } from '@/components/Divider';
</script>

<template>
  <div style="display: grid; inline-size: min(100%, 22rem)">
    <span>Header</span>
    <Divider thickness="2px" spacing="0.75rem" />
    <span>Content</span>
  </div>
</template>
