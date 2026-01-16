<script setup>
import ButtonGroup from '@/components/Button/ButtonGroup.vue';
import Button from '@/components/Button/Button.vue';
</script>

<template>
  <Story :layout="{ type: 'grid', width: '95%' }">
    <Variant title="Single Select">
      <ButtonGroup size="medium" color="tonal">
        <Button>option 1</Button>
        <Button>option 2</Button>
        <Button>option 3</Button>
      </ButtonGroup>
    </Variant>
    <Variant title="Multiple Select">
      <ButtonGroup size="medium" multiple color="filled">
        <Button>option 1</Button>
        <Button>option 2</Button>
        <Button>option 3</Button>
      </ButtonGroup>
    </Variant>
    <Variant title="Connected Single Select">
      <ButtonGroup type="connected" color="filled" size="extra-small">
        <Button>option 1</Button>
        <Button>option 2</Button>
        <Button>option 3</Button>
      </ButtonGroup>
    </Variant>
    <Variant title="Connected Multiple Select">
      <ButtonGroup type="connected" color="filled" multiple>
        <Button>option 1</Button>
        <Button>option 2</Button>
        <Button>option 3</Button>
      </ButtonGroup>
    </Variant>
  </Story>
</template>
