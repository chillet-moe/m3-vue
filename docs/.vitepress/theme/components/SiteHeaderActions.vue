<script setup lang="ts">
import { useData } from 'vitepress';
import { Button, IconButton } from '@/index';
import CustomizationControls from '../../components/CustomizationControls.vue';
import LanguageMenu from './LanguageMenu.vue';
import { useLocaleNavigation, useNav } from '../composables/nav';
import { resolveSocialLabel } from '../utils';

const { isDark } = useData();
const { isChinese } = useLocaleNavigation();
const { socialLinks } = useNav();

function toggleAppearance() {
  isDark.value = !isDark.value;
}
</script>

<template>
  <div class="site-header-actions">
    <slot />
    <IconButton
      variant="standard"
      size="small"
      width="default"
      :icon="isDark ? 'light_mode' : 'dark_mode'"
      :aria-label="
        isDark
          ? isChinese
            ? '切换到浅色模式'
            : 'Switch to light mode'
          : isChinese
            ? '切换到深色模式'
            : 'Switch to dark mode'
      "
      @click="toggleAppearance"
    />

    <CustomizationControls />

    <LanguageMenu />

    <Button
      v-for="link in socialLinks"
      :key="link.link"
      class="site-social-link"
      variant="text"
      size="small"
      :href="link.link"
      trailing-icon="open_in_new"
    >
      {{ resolveSocialLabel(link.link) }}
    </Button>
  </div>
</template>

<style scoped>
.site-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 64rem) {
  .site-social-link {
    display: none;
  }
}

@media (max-width: 32rem) {
  .site-header-actions {
    gap: 0.125rem;
  }
}
</style>
