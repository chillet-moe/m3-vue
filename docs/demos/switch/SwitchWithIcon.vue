<script setup lang="ts">
import { ref } from 'vue';
import { Switch } from '@/components/Switch';

const checked = ref(true);
</script>

<template>
  <Switch v-model:checked="checked" checked-icon="check" unchecked-icon="close">
    Airplane mode
  </Switch>
</template>
