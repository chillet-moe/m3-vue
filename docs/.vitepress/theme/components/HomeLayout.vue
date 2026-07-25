<script setup lang="ts">
import { useData, withBase } from 'vitepress';
import { VPNavBarSearch } from 'vitepress/theme';

import { Button, Icon, IconButton } from '@/index';
import ShapeTokenControls from '../../components/ShapeTokenControls.vue';
import { useHero, useNav, useSiteInfo } from '../composables/nav';
import { mapHeroActionVariant, resolveSocialLabel } from '../utils';

const { isDark } = useData();
const { navItems, socialLinks } = useNav();
const { siteLogo, siteTitle } = useSiteInfo();
const { hero } = useHero();

const guideLinks = [
  {
    icon: 'rocket_launch',
    title: 'Getting started',
    description: 'Install the package and register the Vue plugin.',
    link: '/getting-started',
  },
  {
    icon: 'widgets',
    title: 'Components',
    description: 'Browse component APIs, examples, and styling tokens.',
    link: '/components/button',
  },
  {
    icon: 'palette',
    title: 'Styling',
    description: 'Customize color, shape, typography, and elevation.',
    link: '/guides/styling',
  },
  {
    icon: 'menu_book',
    title: 'Guides',
    description: 'Read about composables, patterns, and integration details.',
    link: '/guides/composables',
  },
] as const;

const componentLinks = [
  { icon: 'smart_button', label: 'Actions', link: '/components/button' },
  { icon: 'edit_note', label: 'Inputs', link: '/components/text-field' },
  { icon: 'toggle_on', label: 'Selection', link: '/components/switch' },
  { icon: 'view_sidebar', label: 'Navigation', link: '/components/navigation-drawer' },
  { icon: 'dialogs', label: 'Containment', link: '/components/dialog' },
  { icon: 'notifications', label: 'Feedback', link: '/components/snackbar' },
] as const;

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
        <Button class="home-brand" variant="text" size="medium" :href="resolveLink('/')">
          <span class="home-brand-mark">
            <span
              v-if="siteLogo"
              class="home-brand-logo"
              :style="{ maskImage: `url(${siteLogo})`, WebkitMaskImage: `url(${siteLogo})` }"
              aria-hidden="true"
            />
          </span>
          <span class="m3-typo-title-medium">{{ siteTitle }}</span>
        </Button>

        <nav v-if="navItems.length" class="home-nav" aria-label="Primary">
          <Button v-for="item in navItems" :key="item.link" variant="text" size="medium" :href="resolveLink(item.link)">
            {{ item.text }}
          </Button>
        </nav>

        <div class="home-actions">
          <VPNavBarSearch class="home-search" />

          <Button
            v-for="link in socialLinks"
            :key="link.link"
            class="home-social-link"
            variant="text"
            size="small"
            :href="link.link"
            trailing-icon="open_in_new"
          >
            {{ resolveSocialLabel(link.link) }}
          </Button>

          <ShapeTokenControls />

          <IconButton
            variant="standard"
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
      <section v-if="hero" class="home-hero" aria-labelledby="home-hero-title">
        <div class="home-hero-copy">
          <p class="home-kicker m3-typo-label-medium">Documentation</p>
          <h1 id="home-hero-title" class="m3-typo-display-large">{{ hero.text }}</h1>
          <p class="home-hero-tagline m3-typo-body-large">{{ hero.tagline }}</p>

          <div class="home-hero-actions">
            <Button
              v-for="action in hero.actions ?? []"
              :key="action.link"
              :variant="mapHeroActionVariant(action.theme)"
              size="medium"
              :href="resolveLink(action.link)"
            >
              {{ action.text }}
            </Button>
          </div>
        </div>

        <div class="home-install" aria-label="Package installation">
          <div class="home-install-header">
            <span class="m3-typo-label-medium">Install</span>
            <span class="m3-typo-body-small">pnpm</span>
          </div>
          <pre><code>pnpm add @chillet/m3-vue</code></pre>
          <a class="home-install-link m3-typo-label-large" :href="resolveLink('/getting-started')">
            Setup instructions
            <Icon name="arrow_forward" />
          </a>
        </div>
      </section>

      <section class="home-section" aria-labelledby="home-docs-title">
        <div class="home-section-heading">
          <h2 id="home-docs-title" class="m3-typo-headline-large">Documentation</h2>
          <p class="m3-typo-body-medium">Start with installation, or go directly to the reference you need.</p>
        </div>

        <div class="home-guide-grid">
          <a v-for="guide in guideLinks" :key="guide.title" class="home-guide-link" :href="resolveLink(guide.link)">
            <span class="home-guide-icon"><Icon :name="guide.icon" /></span>
            <span class="home-guide-copy">
              <strong class="m3-typo-title-medium">{{ guide.title }}</strong>
              <span class="m3-typo-body-medium">{{ guide.description }}</span>
            </span>
            <Icon class="home-link-arrow" name="arrow_forward" />
          </a>
        </div>
      </section>

      <section class="home-section" aria-labelledby="home-components-title">
        <div class="home-section-heading">
          <h2 id="home-components-title" class="m3-typo-headline-large">Components</h2>
          <p class="m3-typo-body-medium">Browse by component category.</p>
        </div>

        <div class="home-component-grid">
          <a
            v-for="component in componentLinks"
            :key="component.label"
            class="home-component-link"
            :href="resolveLink(component.link)"
          >
            <Icon :name="component.icon" />
            <span class="m3-typo-title-small">{{ component.label }}</span>
          </a>
        </div>
      </section>

      <div class="home-content">
        <slot />
      </div>

      <footer class="home-footer">
        <span class="m3-typo-body-small">{{ siteTitle }} documentation</span>
        <a
          v-if="socialLinks[0]"
          class="m3-typo-label-medium"
          :href="socialLinks[0].link"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.home-layout {
  min-block-size: 100vh;
  color: var(--md-sys-color-on-background);
  background: var(--md-sys-color-background);
}

.home-header {
  position: sticky;
  inset-block-start: 0;
  z-index: 20;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
  background: --translucent(var(--md-sys-color-background), 0.9);
  backdrop-filter: blur(16px);
}

.home-header-inner,
.home-main {
  max-inline-size: 76rem;
  margin-inline: auto;
}

.home-header-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  min-block-size: 4rem;
  padding-inline: 1.5rem;
}

.home-brand {
  flex-shrink: 0;
}

.home-brand :deep([data-part='text']) {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  white-space: nowrap;
}

.home-brand-mark {
  display: grid;
  place-items: center;
  inline-size: 2rem;
  block-size: 2rem;
  border-radius: 0.625rem;
  background: var(--md-sys-color-primary-container);
}

.home-brand-logo {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  background: var(--md-sys-color-on-primary-container);
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.home-nav,
.home-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.home-nav {
  justify-content: end;
}

.home-search :deep(.VPNavBarSearchButton) {
  block-size: 2.5rem;
  padding-inline: 0.875rem;
  border: 0;
  border-radius: 1.25rem;
  color: var(--md-sys-color-on-surface-variant);
  background: var(--md-sys-color-surface-container);
  font-family: var(--md-sys-typescale-label-large-font), sans-serif;
  font-weight: var(--md-sys-typescale-label-large-weight);
  font-size: var(--md-sys-typescale-label-large-size);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  line-height: var(--md-sys-typescale-label-large-line-height);
}

.home-main {
  display: grid;
  gap: 4.5rem;
  padding: 5.5rem 1.5rem 2rem;
}

.home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(20rem, 27rem);
  align-items: center;
  gap: clamp(3rem, 8vw, 8rem);
  padding-block: 2rem;
}

.home-hero-copy {
  display: grid;
  justify-items: start;
  gap: 1.25rem;
}

.home-kicker,
.home-hero-copy h1,
.home-hero-tagline,
.home-section-heading h2,
.home-section-heading p {
  margin: 0;
}

.home-kicker {
  color: var(--md-sys-color-primary);
  text-transform: uppercase;
}

.home-hero-copy h1 {
  text-wrap: balance;
}

.home-hero-tagline {
  max-inline-size: 34rem;
  color: var(--md-sys-color-on-surface-variant);
}

.home-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}

.home-install {
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 1.5rem;
  background: var(--md-sys-color-surface-container-low);
}

.home-install-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-on-surface-variant);
}

.home-install pre {
  margin: 0;
  padding: 1.5rem 1.25rem;
  overflow: auto;
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface-container-lowest);
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.home-install-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  color: var(--md-sys-color-primary);
  text-decoration: none;
}

.home-section {
  display: grid;
  gap: 1.5rem;
}

.home-section-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 1.5rem;
  padding-block-end: 1rem;
  border-block-end: 1px solid var(--md-sys-color-outline-variant);
}

.home-section-heading p {
  max-inline-size: 32rem;
  color: var(--md-sys-color-on-surface-variant);
  text-align: end;
}

.home-guide-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.home-guide-link {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  min-block-size: 7rem;
  padding: 1.25rem;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 1.25rem;
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface-container-lowest);
  text-decoration: none;
  transition:
    border-color 160ms ease,
    background-color 160ms ease;
}

.home-guide-link:hover {
  border-color: var(--md-sys-color-outline);
  background: var(--md-sys-color-surface-container-low);
}

.home-guide-icon {
  display: grid;
  place-items: center;
  inline-size: 2.75rem;
  block-size: 2.75rem;
  border-radius: 0.875rem;
  color: var(--md-sys-color-primary);
  background: var(--md-sys-color-primary-container);
}

.home-guide-copy {
  display: grid;
  gap: 0.25rem;
}

.home-guide-copy > span {
  color: var(--md-sys-color-on-surface-variant);
}

.home-link-arrow {
  color: var(--md-sys-color-on-surface-variant);
}

.home-component-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.home-component-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-block-size: 4rem;
  padding-inline: 1rem;
  border-radius: 1rem;
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface-container-low);
  text-decoration: none;
  transition: background-color 160ms ease;
}

.home-component-link:hover {
  background: var(--md-sys-color-surface-container);
}

.home-component-link > :deep(.m3-icon) {
  color: var(--md-sys-color-primary);
}

.home-guide-link:focus-visible,
.home-component-link:focus-visible,
.home-install-link:focus-visible,
.home-footer a:focus-visible {
  outline: 0.1875rem solid var(--md-sys-color-primary);
  outline-offset: 0.1875rem;
}

.home-content:empty {
  display: none;
}

.home-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-block: 1.5rem 0.5rem;
  border-block-start: 1px solid var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-on-surface-variant);
}

.home-footer a {
  color: var(--md-sys-color-primary);
  text-decoration: none;
}

@media (max-width: 64rem) {
  .home-nav {
    display: none;
  }
}

@media (max-width: 48rem) {
  .home-social-link {
    display: none;
  }

  .home-search :deep(.VPNavBarSearchButton .text),
  .home-search :deep(.VPNavBarSearchButton .keys) {
    display: none;
  }

  .home-main {
    gap: 3.5rem;
    padding-block-start: 3rem;
  }

  .home-hero {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding-block: 1rem;
  }

  .home-install {
    max-inline-size: 30rem;
  }

  .home-section-heading {
    align-items: start;
    flex-direction: column;
    gap: 0.5rem;
  }

  .home-section-heading p {
    text-align: start;
  }

  .home-guide-grid {
    grid-template-columns: 1fr;
  }

  .home-component-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 32rem) {
  .home-header-inner,
  .home-main {
    padding-inline: 1rem;
  }

  .home-actions {
    gap: 0.125rem;
  }

  .home-component-grid {
    grid-template-columns: 1fr;
  }
}
</style>
