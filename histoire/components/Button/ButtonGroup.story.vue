<script setup>
import ButtonGroup from '@/components/Button/ButtonGroup.vue';
import Button from '@/components/Button/Button.vue';
</script>

<template>
  <Story :layout="{ type: 'grid', width: '45%' }">
    <Variant title="Single Select">
      <ButtonGroup>
        <Button variant="Tonal" size="M" shape="Rounded" toggleable="single"> A </Button>
        <Button variant="Tonal" size="M" shape="Rounded" toggleable="single"> B </Button>
        <Button variant="Tonal" size="M" shape="Rounded" toggleable="single"> C </Button>
      </ButtonGroup>
    </Variant>
    <Variant title="Multiple Select">
      <ButtonGroup>
        <Button variant="Filled" size="M" shape="Rounded" toggleable="multiple"> A </Button>
        <Button variant="Filled" size="M" shape="Rounded" toggleable="multiple"> B </Button>
        <Button variant="Filled" size="M" shape="Rounded" toggleable="multiple"> C </Button>
      </ButtonGroup>
    </Variant>
  </Story>
</template>
