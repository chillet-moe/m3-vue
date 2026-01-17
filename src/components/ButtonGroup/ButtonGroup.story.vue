<script setup>
import Button from '@/components/Button/Button.vue';
import ButtonGroup from '@/components/ButtonGroup/ButtonGroup.vue';
</script>

<template>
  <Story :layout="{ type: 'grid', width: '95%' }">
    <Variant title="Single Select">
      <ButtonGroup size="medium" color="tonal">
        <Button><input type="radio" name="buttongroup"/>option 1</Button>
        <Button><input type="radio" name="buttongroup"/>option 2</Button>
        <Button><input type="radio" name="buttongroup"/>option 3</Button>
      </ButtonGroup>
    </Variant>
    <Variant title="Multiple Select">
      <ButtonGroup size="medium" multiple color="filled">
        <Button><input type="checkbox" name="buttongroup"/>option 1</Button>
        <Button><input type="checkbox" name="buttongroup"/>option 2</Button>
        <Button><input type="checkbox" name="buttongroup"/>option 3</Button>
      </ButtonGroup>
    </Variant>
    <Variant title="Connected Single Select">
      <ButtonGroup type="connected" color="filled" size="extra-small">
        <Button><input type="radio" name="buttongroup"/>option 1</Button>
        <Button><input type="radio" name="buttongroup"/>option 2</Button>
        <Button><input type="radio" name="buttongroup"/>option 3</Button>
      </ButtonGroup>
    </Variant>
    <Variant title="Connected Multiple Select">
      <ButtonGroup type="connected" color="filled" multiple>
        <Button><input type="checkbox" name="buttongroup"/>option 1</Button>
        <Button><input type="checkbox" name="buttongroup"/>option 2</Button>
        <Button><input type="checkbox" name="buttongroup"/>option 3</Button>
      </ButtonGroup>
    </Variant>
  </Story>
</template>
