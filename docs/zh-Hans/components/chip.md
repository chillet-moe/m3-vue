---
title: Chip
---

<script setup lang="ts">
import { ref } from 'vue';
import { Chip } from '@/components/Chip';

import ChipDefault from '../../demos/chip/ChipDefault.vue';
import ChipDefaultSrc from '../../demos/chip/ChipDefault.vue?raw';
import ChipVariants from '../../demos/chip/ChipVariants.vue';
import ChipVariantsSrc from '../../demos/chip/ChipVariants.vue?raw';
import ChipIcons from '../../demos/chip/ChipIcons.vue';
import ChipIconsSrc from '../../demos/chip/ChipIcons.vue?raw';
import ChipAvatar from '../../demos/chip/ChipAvatar.vue';
import ChipAvatarSrc from '../../demos/chip/ChipAvatar.vue?raw';
import ChipGroupSelection from '../../demos/chip/ChipGroupSelection.vue';
import ChipGroupSelectionSrc from '../../demos/chip/ChipGroupSelection.vue?raw';
import ChipDisabled from '../../demos/chip/ChipDisabled.vue';
import ChipDisabledSrc from '../../demos/chip/ChipDisabled.vue?raw';

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

Chip 支持辅助、建议、筛选和输入等场景，并统一提供选择、图标和头像功能。

<DemoContainer :viewport="false">
  <Chip v-bind="props" v-model="selected">Chip</Chip>
</DemoContainer>

## 示例

### 默认

<DemoContainer :src="ChipDefaultSrc" :viewport="false">
  <ChipDefault />
</DemoContainer>

### 变体

<DemoContainer :src="ChipVariantsSrc" :viewport="false">
  <ChipVariants />
</DemoContainer>

### 图标

<DemoContainer :src="ChipIconsSrc" :viewport="false">
  <ChipIcons />
</DemoContainer>

### 头像

<DemoContainer :src="ChipAvatarSrc" :viewport="false">
  <ChipAvatar />
</DemoContainer>

### 选择组

<DemoContainer :src="ChipGroupSelectionSrc" :viewport="false">
  <ChipGroupSelection />
</DemoContainer>

### 禁用

<DemoContainer :src="ChipDisabledSrc" :viewport="false">
  <ChipDisabled />
</DemoContainer>

## 参考

<AnatomyTable scope="chip" />

<ApiTable component="Chip" v-model="props" :exclude="['value', 'name', 'ariaLabel']" />

<StyleTokenTable component="Chip" />
