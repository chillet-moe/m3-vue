<script setup lang="ts">
import { withBase } from 'vitepress';
import { VPNavBarSearch } from 'vitepress/theme';

import { Button, Card, IconButton } from '@/index';
import { mapHeroActionColor, resolveSocialLabel, type HeroAction, type ThemeNavItem, type ThemeSocialLink } from '../utils';

const props = defineProps<{
  hero?: {
    name?: string;
    text?: string;
    tagline?: string;
    actions?: HeroAction[];
  } | null;
  isDark: boolean;
  navItems: ThemeNavItem[];
  siteLogo?: string;
  siteTitle: string;
  socialLinks: ThemeSocialLink[];
}>();

const emit = defineEmits<{
  toggleAppearance: [];
}>();

function resolveLink(path: string) {
  return withBase(path);
}
</script>

<template>
  <div class="home-layout">
    <header class="home-header">
      <div class="home-header-inner">
        <Button class="home-brand" color="text" size="medium" :href="resolveLink('/')">
          <img v-if="siteLogo" class="home-brand-logo" :src="siteLogo" alt="" />
          <span class="home-brand-text">{{ siteTitle }}</span>
        </Button>

        <nav v-if="navItems.length" class="home-nav" aria-label="Primary">
          <Button
            v-for="item in navItems"
            :key="item.link"
            class="home-nav-link"
            color="text"
            size="medium"
            :href="resolveLink(item.link)"
          >
            {{ item.text }}
          </Button>
        </nav>

        <div class="home-actions">
          <VPNavBarSearch class="home-search" />

          <Button
            v-for="link in socialLinks"
            :key="link.link"
            class="home-social-link"
            color="text"
            size="small"
            :href="link.link"
            trailing-icon="open_in_new"
          >
            {{ resolveSocialLabel(link.link) }}
          </Button>

          <IconButton
            color="standard"
            size="small"
            width="default"
            :icon="isDark ? 'light_mode' : 'dark_mode'"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="emit('toggleAppearance')"
          />
        </div>
      </div>
    </header>

    <main class="home-main">
      <Card v-if="hero" color="filled" class="home-hero">
        <div class="home-hero-content">
          <p class="home-hero-eyebrow">{{ hero.name || siteTitle }}</p>
          <h1 class="home-hero-title">{{ hero.text }}</h1>
          <p class="home-hero-tagline">{{ hero.tagline }}</p>

          <div class="home-hero-actions">
            <Button
              v-for="action in hero.actions ?? []"
              :key="action.link"
              :color="mapHeroActionColor(action.theme)"
              size="large"
              :href="resolveLink(action.link)"
            >
              {{ action.text }}
            </Button>
          </div>
        </div>
      </Card>

      <div class="home-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-layout {
  min-block-size: 100vh;
  background:
    radial-gradient(circle at top, --translucent(var(--md-sys-color-primary), 0.12), transparent 28rem),
    linear-gradient(180deg, var(--vp-c-bg-alt) 0%, var(--vp-c-bg) 18rem);
}

.home-header {
  position: sticky;
  inset-block-start: 0;
  z-index: 20;
  padding: --dp(16);
  backdrop-filter: blur(20px);
}

.home-header-inner,
.home-main {
  max-inline-size: 96rem;
  margin-inline: auto;
}

.home-header-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: --dp(12);
  align-items: center;
  border: 1px solid --translucent(var(--vp-c-divider), 0.7);
  border-radius: --dp(28);
  padding-block: --dp(10);
  padding-inline: --dp(12);
  background: --translucent(var(--vp-c-bg), 0.78);
}

.home-brand:deep(.m3-button) {
  gap: --dp(10);
}

.home-brand-logo {
  inline-size: --dp(24);
  block-size: --dp(24);
}

.home-brand-text {
  font-size: --dp(16);
  font-weight: 700;
}

.home-nav,
.home-actions {
  display: flex;
  align-items: center;
  gap: --dp(8);
}

.home-nav {
  justify-content: center;
  flex-wrap: wrap;
}

.home-search :deep(.VPNavBarSearchButton) {
  border: 1px solid --translucent(var(--vp-c-divider), 0.7);
  border-radius: 999px;
  background: --translucent(var(--vp-c-bg-alt), 0.5);
  block-size: --dp(36);
  padding-inline: --dp(12);
  font-family: inherit;
  font-size: --dp(14);
  color: var(--vp-c-text-2);
}

.home-main {
  display: grid;
  gap: --dp(24);
  padding: 0 --dp(16) --dp(32);
}

.home-hero {
  border-radius: --dp(28);
  overflow: clip;
}

.home-hero-content {
  display: grid;
  gap: --dp(16);
  padding: --dp(32);
}

.home-hero-eyebrow,
.home-hero-title,
.home-hero-tagline {
  margin: 0;
}

.home-hero-eyebrow {
  color: var(--vp-c-text-2);
  font-size: --dp(14);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.home-hero-title {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1;
}

.home-hero-tagline {
  max-inline-size: 40rem;
  color: var(--vp-c-text-2);
  font-size: --dp(18);
  line-height: 1.6;
}

.home-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: --dp(12);
}

.home-content {
  display: grid;
  gap: --dp(16);
}

@media (max-width: 80rem) {
  .home-nav {
    display: none;
  }
}

@media (max-width: 64rem) {
  .home-header {
    padding-inline: --dp(12);
  }

  .home-header-inner {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .home-social-link {
    display: none;
  }

  .home-search :deep(.VPNavBarSearchButton .text),
  .home-search :deep(.VPNavBarSearchButton .keys) {
    display: none;
  }
}
</style>
