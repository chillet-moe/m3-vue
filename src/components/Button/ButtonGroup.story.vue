<script setup>
import ButtonGroup from '@/components/Button/ButtonGroup.vue';
import Button from '@/components/Button/Button.vue';
</script>

<template>
  <Story :layout="{ type: 'grid', width: '95%' }">
    <Variant title="Single Select">
      <ButtonGroup size="medium">
        <Button color="tonal" size="medium" shape="rounded" toggleable="single">option 1</Button>
        <Button color="tonal" size="medium" shape="rounded" toggleable="single">option 2</Button>
        <Button color="tonal" size="medium" shape="rounded" toggleable="single">option 3</Button>
      </ButtonGroup>
    </Variant>
    <Variant title="Multiple Select">
      <ButtonGroup size="medium">
        <Button color="filled" size="medium" shape="rounded" toggleable="multiple">option 1</Button>
        <Button color="filled" size="medium" shape="rounded" toggleable="multiple">option 2</Button>
        <Button color="filled" size="medium" shape="rounded" toggleable="multiple">option 3</Button>
      </ButtonGroup>
    </Variant>
    <Variant title="Connected Single Select">
      <ButtonGroup type="connected" size="medium">
        <Button color="filled" size="medium" shape="square" toggleable="single">option 1</Button>
        <Button color="filled" size="medium" shape="square" toggleable="single">option 2</Button>
        <Button color="filled" size="medium" shape="square" toggleable="single">option 3</Button>
      </ButtonGroup>
    </Variant>
    <Variant title="Connected Multiple Select">
      <ButtonGroup type="connected" size="medium">
        <Button color="filled" size="medium" shape="rounded" toggleable="multiple">option 1</Button>
        <Button color="filled" size="medium" shape="rounded" toggleable="multiple">option 2</Button>
        <Button color="filled" size="medium" shape="rounded" toggleable="multiple">option 3</Button>
      </ButtonGroup>
    </Variant>
  </Story>
</template>
