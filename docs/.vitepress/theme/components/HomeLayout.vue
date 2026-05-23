<script setup lang="ts">
import { useData, withBase } from 'vitepress';
import { VPNavBarSearch } from 'vitepress/theme';

import { Button, Card, IconButton } from '@/index';
import ShapeTokenControls from '../../components/ShapeTokenControls.vue';
import { useHero, useNav, useSiteInfo } from '../composables/nav';
import { mapHeroActionColor, resolveSocialLabel } from '../utils';

const { isDark } = useData();
const { navItems, socialLinks } = useNav();
const { siteLogo, siteTitle } = useSiteInfo();
const { hero } = useHero();

function resolveLink(path: string) {
  return withBase(path);
}

function toggleAppearance() {
  isDark.value = !isDark.value;
}
</script>

<template>
  <div class="home-layout vp-raw">
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

          <ShapeTokenControls />

          <IconButton
            color="standard"
            size="small"
            width="default"
            :icon="isDark ? 'light_mode' : 'dark_mode'"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleAppearance"
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
  padding: 1rem;
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
  gap: 0.75rem;
  align-items: center;
  border: 1px solid --translucent(var(--vp-c-divider), 0.7);
  border-radius: 1.75rem;
  padding-block: 0.625rem;
  padding-inline: 0.75rem;
  background: --translucent(var(--vp-c-bg), 0.78);
}

.home-brand {
  gap: 0.625rem;
}

.home-brand-logo {
  inline-size: 1.5rem;
  block-size: 1.5rem;
}

.home-brand-text {
  font-size: 1rem;
  font-weight: 700;
}

.home-nav,
.home-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.home-nav {
  justify-content: end;
  flex-wrap: wrap;
}

.home-search :deep(.VPNavBarSearchButton) {
  border: 1px solid --translucent(var(--vp-c-divider), 0.7);
  border-radius: 999px;
  background: --translucent(var(--vp-c-bg-alt), 0.5);
  block-size: 2.25rem;
  padding-inline: 0.75rem;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.home-main {
  display: grid;
  gap: 1.5rem;
  padding: 0 1rem 2rem;
}

.home-hero {
  border-radius: 1.75rem;
  overflow: clip;
}

.home-hero-content {
  display: grid;
  gap: 1rem;
  padding: 2rem;
}

.home-hero-eyebrow,
.home-hero-title,
.home-hero-tagline {
  margin: 0;
}

.home-hero-eyebrow {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
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
  font-size: 1.125rem;
  line-height: 1.6;
}

.home-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.home-content {
  display: grid;
  gap: 1rem;
}

@media (max-width: 80rem) {
  .home-nav {
    display: none;
  }
}

@media (max-width: 64rem) {
  .home-header {
    padding-inline: 0.75rem;
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
