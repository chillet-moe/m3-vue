---
title: Chip
---

<script setup lang="ts">
import { ref } from 'vue';
import { Chip } from '@/components/Chip';

import ChipDefault from '../demos/chip/ChipDefault.vue';
import ChipDefaultSrc from '../demos/chip/ChipDefault.vue?raw';
import ChipVariants from '../demos/chip/ChipVariants.vue';
import ChipVariantsSrc from '../demos/chip/ChipVariants.vue?raw';
import ChipIcons from '../demos/chip/ChipIcons.vue';
import ChipIconsSrc from '../demos/chip/ChipIcons.vue?raw';
import ChipAvatar from '../demos/chip/ChipAvatar.vue';
import ChipAvatarSrc from '../demos/chip/ChipAvatar.vue?raw';
import ChipGroupSelection from '../demos/chip/ChipGroupSelection.vue';
import ChipGroupSelectionSrc from '../demos/chip/ChipGroupSelection.vue?raw';
import ChipDisabled from '../demos/chip/ChipDisabled.vue';
import ChipDisabledSrc from '../demos/chip/ChipDisabled.vue?raw';

const props = ref({
  variant: 'filter',
  elevated: false,
  disabled: false,
  leadingIcon: undefined,
  trailingIcon: undefined,
  avatarSrc: undefined,
  selectedIcon: 'check',
});

const selected = ref(false);
</script>

# Chip

Chips cover assist, suggestion, filter, and input patterns with shared selection, icon, and avatar support.

<DemoContainer :viewport="false">
  <Chip v-bind="props" v-model="selected">Chip</Chip>
</DemoContainer>

<ApiTable component="Chip" v-model="props" :exclude="['value', 'name', 'ariaLabel']" />

### Default

<DemoContainer :src="ChipDefaultSrc" :viewport="false">
  <ChipDefault />
</DemoContainer>

### Variants

<DemoContainer :src="ChipVariantsSrc" :viewport="false">
  <ChipVariants />
</DemoContainer>

### Icons

<DemoContainer :src="ChipIconsSrc" :viewport="false">
  <ChipIcons />
</DemoContainer>

### Avatar

<DemoContainer :src="ChipAvatarSrc" :viewport="false">
  <ChipAvatar />
</DemoContainer>

### Selection Group

<DemoContainer :src="ChipGroupSelectionSrc" :viewport="false">
  <ChipGroupSelection />
</DemoContainer>

### Disabled

<DemoContainer :src="ChipDisabledSrc" :viewport="false">
  <ChipDisabled />
</DemoContainer>
