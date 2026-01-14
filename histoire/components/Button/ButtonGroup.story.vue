<script setup>
import ButtonGroup from '@/components/Button/ButtonGroup.vue';
import Button from '@/components/Button/Button.vue';
</script>

<template>
  <Story :layout="{ type: 'single' }">
    <ButtonGroup>
      <Button variant="Tonal" size="M" shape="Rounded" toggleable="multiple"> A </Button>
      <Button variant="Tonal" size="M" shape="Rounded" toggleable="multiple"> B </Button>
      <Button variant="Tonal" size="M" shape="Rounded" toggleable="multiple"> C </Button>
    </ButtonGroup>
  </Story>
</template>
