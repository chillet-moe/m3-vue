<script setup lang="ts">
import { withBase } from 'vitepress';
import { VPNavBarSearch } from 'vitepress/theme';
import { computed } from 'vue';

import { Button, Card, ListItem } from '@/index';
import SiteHeaderActions from './SiteHeaderActions.vue';
import { useHero, useLocaleNavigation, useNav, useSiteInfo } from '../composables/nav';
import { mapHeroActionVariant } from '../utils';

const { navItems, socialLinks } = useNav();
const { siteLogo, siteTitle } = useSiteInfo();
const { hero } = useHero();
const { isChinese, homeLink, localizePath } = useLocaleNavigation();

const guideLinks = computed(() => [
  {
    icon: 'rocket_launch',
    title: isChinese.value ? '快速开始' : 'Getting started',
    description: isChinese.value ? '安装组件库并注册 Vue 插件。' : 'Install the package and register the Vue plugin.',
    link: localizePath('/getting-started'),
  },
  {
    icon: 'widgets',
    title: isChinese.value ? '组件' : 'Components',
    description: isChinese.value
      ? '查看组件 API、示例和样式令牌。'
      : 'Browse component APIs, examples, and styling tokens.',
    link: localizePath('/components/button'),
  },
  {
    icon: 'palette',
    title: isChinese.value ? '样式定制' : 'Styling',
    description: isChinese.value
      ? '定制颜色、形状、排版和海拔高度。'
      : 'Customize color, shape, typography, and elevation.',
    link: localizePath('/guides/styling'),
  },
  {
    icon: 'menu_book',
    title: isChinese.value ? '指南' : 'Guides',
    description: isChinese.value
      ? '了解组合式函数、使用模式和集成方式。'
      : 'Read about composables, patterns, and integration details.',
    link: localizePath('/guides/composables'),
  },
]);

const componentLinks = computed(() => [
  { icon: 'smart_button', label: isChinese.value ? '操作' : 'Actions', link: localizePath('/components/button') },
  { icon: 'edit_note', label: isChinese.value ? '输入' : 'Inputs', link: localizePath('/components/text-field') },
  { icon: 'toggle_on', label: isChinese.value ? '选择' : 'Selection', link: localizePath('/components/switch') },
  {
    icon: 'view_sidebar',
    label: isChinese.value ? '导航' : 'Navigation',
    link: localizePath('/components/navigation-drawer'),
  },
  { icon: 'dialogs', label: isChinese.value ? '容器' : 'Containment', link: localizePath('/components/dialog') },
  { icon: 'notifications', label: isChinese.value ? '反馈' : 'Feedback', link: localizePath('/components/snackbar') },
]);

function resolveLink(path: string) {
  return withBase(path);
}
</script>

<template>
  <div class="home-layout vp-raw">
    <header class="home-header">
      <div class="home-header-inner">
        <div class="home-header-leading">
          <Button class="home-brand" variant="text" size="small" :href="resolveLink(homeLink)">
            <span class="home-brand-content">
              <span
                v-if="siteLogo"
                class="home-brand-logo"
                :style="{ maskImage: `url(${siteLogo})`, WebkitMaskImage: `url(${siteLogo})` }"
                aria-hidden="true"
              />
              <span class="m3-typo-title-medium">{{ siteTitle }}</span>
            </span>
          </Button>
          <VPNavBarSearch class="home-search" />
        </div>

        <nav v-if="navItems.length" class="home-nav" :aria-label="isChinese ? '主导航' : 'Primary'">
          <Button
            v-for="item in navItems"
            :key="item.link"
            variant="text"
            size="small"
            :press-shape-morph="false"
            :href="resolveLink(item.link)"
          >
            {{ item.text }}
          </Button>
        </nav>

        <SiteHeaderActions />
      </div>
    </header>

    <main class="home-main">
      <section v-if="hero" class="home-hero" aria-labelledby="home-hero-title">
        <div class="home-hero-copy">
          <p class="home-kicker m3-typo-label-medium">{{ isChinese ? '文档' : 'Documentation' }}</p>
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

        <Card color="outlined" class="home-install" :aria-label="isChinese ? '安装组件库' : 'Package installation'">
          <div class="home-install-header">
            <span class="m3-typo-label-medium">{{ isChinese ? '安装' : 'Install' }}</span>
            <span class="m3-typo-body-small">pnpm</span>
          </div>
          <pre><code>pnpm add @chillet/m3-vue</code></pre>
          <Button
            variant="text"
            size="small"
            trailing-icon="arrow_forward"
            class="home-install-link"
            :href="resolveLink(localizePath('/getting-started'))"
          >
            {{ isChinese ? '安装说明' : 'Setup instructions' }}
          </Button>
        </Card>
      </section>

      <section class="home-section" aria-labelledby="home-docs-title">
        <div class="home-section-heading">
          <h2 id="home-docs-title" class="m3-typo-headline-large">{{ isChinese ? '文档' : 'Documentation' }}</h2>
          <p class="m3-typo-body-medium">
            {{
              isChinese
                ? '从安装开始，或直接查阅所需内容。'
                : 'Start with installation, or go directly to the reference you need.'
            }}
          </p>
        </div>

        <div class="home-guide-grid">
          <ListItem
            v-for="guide in guideLinks"
            :key="guide.title"
            :href="resolveLink(guide.link)"
            :title="guide.title"
            :description="guide.description"
            :leading-icon="guide.icon"
            trailing-icon="arrow_forward"
          />
        </div>
      </section>

      <section class="home-section" aria-labelledby="home-components-title">
        <div class="home-section-heading">
          <h2 id="home-components-title" class="m3-typo-headline-large">{{ isChinese ? '组件' : 'Components' }}</h2>
          <p class="m3-typo-body-medium">{{ isChinese ? '按组件类别浏览。' : 'Browse by component category.' }}</p>
        </div>

        <div class="home-component-grid">
          <ListItem
            v-for="component in componentLinks"
            :key="component.label"
            :href="resolveLink(component.link)"
            :title="component.label"
            :leading-icon="component.icon"
          />
        </div>
      </section>

      <div class="home-content">
        <slot />
      </div>

      <footer class="home-footer">
        <span class="m3-typo-body-small">{{ siteTitle }} {{ isChinese ? '文档' : 'documentation' }}</span>
        <Button
          v-if="socialLinks[0]"
          variant="text"
          size="small"
          :href="socialLinks[0].link"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </Button>
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

.home-brand-content {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  white-space: nowrap;
}

.home-brand-logo {
  inline-size: 1.125rem;
  block-size: 1.125rem;
  background: currentColor;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.home-nav,
.home-header-leading {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.home-nav {
  justify-content: end;
}

.home-search {
  padding: 0;
  flex-grow: 0;
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
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
  min-inline-size: 0;
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
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.home-install-link {
  margin: 0.75rem;
  align-self: start;
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

.home-component-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
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

@media (max-width: 64rem) {
  .home-header-inner {
    grid-template-columns: 1fr auto;
  }

  .home-nav {
    display: none;
  }
}

@media (max-width: 48rem) {
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

  .home-header-leading {
    gap: 0.125rem;
  }

  .home-component-grid {
    grid-template-columns: 1fr;
  }
}
</style>
