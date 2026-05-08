<script setup lang="ts">
import { ref } from 'vue';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';

const empty = ref('');
const input = ref('Input');
const amount = ref('1.43');
const multiline = ref('This is a long input in a multi-line text field that wraps overflow text onto a new line');
</script>

<template>
  <div style="display: grid; gap: 1rem; max-inline-size: 24rem">
    <TextField label="Label" v-model="empty" description="Supporting text" />
    <TextField label="Label" v-model="input" error="Error text" />
    <TextField label="Label" v-model="empty" placeholder="Search keyword">
      <template #leading>
        <span class="m3-icon">search</span>
      </template>
    </TextField>
    <TextField label="Amount" v-model="amount">
      <template #prefix>$</template>
      <template #suffix>USD</template>
      <template #trailing>
        <IconButton icon="close" aria-label="Clear" @click="amount = ''" color="standard" />
      </template>
    </TextField>
    <TextField label="Label" v-model="multiline" as="textarea" :rows="4" />
    <Button shape="square">Button</Button>
  </div>
</template>
