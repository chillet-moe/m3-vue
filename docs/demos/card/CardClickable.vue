<script setup lang="ts">
import { Card } from '@/components/Card';
import { Tooltip } from '@/components/Tooltip';
import { useId } from 'vue';

const id = useId();
</script>

<template>
  <Card
    clickable
    style="display: grid; gap: 0.5rem; inline-size: 15rem; min-block-size: 9rem; padding: 1rem; text-align: start"
  >
    <strong v-tooltip="`#tooltip-${id}`"> Repository sync </strong>
    <Tooltip :id="`tooltip-${id}`"> tooltip </Tooltip>
    <span>Open details about the latest sync status.</span>
  </Card>
</template>
