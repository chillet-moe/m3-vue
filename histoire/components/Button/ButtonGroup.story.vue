<script setup>
import ButtonGroup from '@/components/Button/ButtonGroup.vue';
import Button from '@/components/Button/Button.vue';
</script>

<template>
  <Story :layout="{ type: 'grid', width: '45%' }">
    <Variant title="Single Select">
      <ButtonGroup>
        <Button variant="tonal" size="medium" shape="rounded" toggleable="single"> A </Button>
        <Button variant="tonal" size="medium" shape="rounded" toggleable="single"> B </Button>
        <Button variant="tonal" size="medium" shape="rounded" toggleable="single"> C </Button>
      </ButtonGroup>
    </Variant>
    <Variant title="Multiple Select">
      <ButtonGroup>
        <Button variant="filled" size="medium" shape="rounded" toggleable="multiple"> A </Button>
        <Button variant="filled" size="medium" shape="rounded" toggleable="multiple"> B </Button>
        <Button variant="filled" size="medium" shape="rounded" toggleable="multiple"> C </Button>
      </ButtonGroup>
    </Variant>
  </Story>
</template>
