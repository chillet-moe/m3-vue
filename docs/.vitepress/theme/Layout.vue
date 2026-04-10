<script setup lang="ts">
import { Content, useData, useRoute, withBase } from 'vitepress';
import { computed, ref, watch } from 'vue';

import { Button, Card, IconButton } from '@/index';

type ThemeNavItem = {
  text: string;
  link: string;
};

type ThemeSidebarItem = {
  text: string;
  link: string;
};

type ThemeSidebarGroup = {
  text?: string;
  items?: ThemeSidebarItem[];
};

type ThemeSocialLink = {
  icon?: string;
  link: string;
};

type OutlineItem = {
  title: string;
  link: string;
  depth: number;
};

type HeroAction = {
  theme?: 'brand' | 'alt';
  text: string;
  link: string;
};

const { site, theme, page, frontmatter, isDark } = useData();
const route = useRoute();

const isSidebarOpen = ref(false);

watch(
  () => route.path,
  () => {
    isSidebarOpen.value = false;
  },
);

const currentPath = computed(() => {
  return normalizePath(route.path);
});

const navItems = computed<ThemeNavItem[]>(() => {
  return Array.isArray(theme.value.nav) ? (theme.value.nav as ThemeNavItem[]) : [];
});

const socialLinks = computed<ThemeSocialLink[]>(() => {
  return Array.isArray(theme.value.socialLinks) ? (theme.value.socialLinks as ThemeSocialLink[]) : [];
});

const sidebarGroups = computed<ThemeSidebarGroup[]>(() => {
  const sidebar = theme.value.sidebar;

  if (Array.isArray(sidebar)) {
    return sidebar as ThemeSidebarGroup[];
  }

  if (!sidebar || typeof sidebar !== 'object') {
    return [];
  }

  const matchedKey = Object.keys(sidebar)
    .sort((left, right) => right.length - left.length)
    .find((key) => currentPath.value.startsWith(normalizePath(key)));

  if (!matchedKey) {
    return [];
  }

  const matchedSidebar = sidebar[matchedKey];
  return Array.isArray(matchedSidebar) ? (matchedSidebar as ThemeSidebarGroup[]) : [];
});

const flatSidebarItems = computed<ThemeSidebarItem[]>(() => {
  return sidebarGroups.value.flatMap((group) => group.items ?? []);
});

const currentSidebarIndex = computed(() => {
  return flatSidebarItems.value.findIndex((item) => normalizePath(item.link) === currentPath.value);
});

const previousItem = computed(() => {
  if (currentSidebarIndex.value <= 0) {
    return null;
  }

  return flatSidebarItems.value[currentSidebarIndex.value - 1] ?? null;
});

const nextItem = computed(() => {
  if (currentSidebarIndex.value < 0) {
    return null;
  }

  return flatSidebarItems.value[currentSidebarIndex.value + 1] ?? null;
});

const outlineItems = computed<OutlineItem[]>(() => {
  const headers = Array.isArray(page.value.headers) ? page.value.headers : [];
  return flattenHeaders(headers);
});

const showHomeLayout = computed(() => {
  return frontmatter.value.layout === 'home';
});

const hero = computed(() => {
  return typeof frontmatter.value.hero === 'object' && frontmatter.value.hero ? frontmatter.value.hero : null;
});

const siteLogo = computed(() => {
  return typeof theme.value.logo === 'string' ? withBase(theme.value.logo) : undefined;
});

const siteTitle = computed(() => {
  return site.value.title || 'M3 Vue';
});

function normalizePath(path: string) {
  if (!path) {
    return '/';
  }

  let normalizedPath = path.replace(/\.html$/, '');

  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  return normalizedPath || '/';
}

function resolveLink(path: string) {
  return withBase(path);
}

function isActiveLink(path: string) {
  return normalizePath(path) === currentPath.value;
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function closeSidebar() {
  isSidebarOpen.value = false;
}

function toggleAppearance() {
  isDark.value = !isDark.value;
}

function flattenHeaders(
  headers: Array<{ title: string; link: string; children?: Array<{ title: string; link: string; children?: any[] }> }>,
  depth = 0,
): OutlineItem[] {
  return headers.flatMap((header) => {
    return [
      {
        title: header.title,
        link: header.link,
        depth,
      },
      ...flattenHeaders(header.children ?? [], depth + 1),
    ];
  });
}

function resolveSocialLabel(link: string) {
  if (link.includes('github.com')) {
    return 'GitHub';
  }

  return 'External';
}

function mapHeroActionColor(actionTheme?: 'brand' | 'alt') {
  if (actionTheme === 'brand') {
    return 'filled';
  }

  if (actionTheme === 'alt') {
    return 'outlined';
  }

  return 'text';
}
</script>

<template>
  <div v-if="frontmatter.layout !== false" class="docs-layout" :class="[frontmatter.pageClass, { 'docs-layout-home': showHomeLayout }]">
    <div
      class="docs-backdrop"
      :data-open="isSidebarOpen ? 'true' : 'false'"
      @click="closeSidebar"
    />

    <header class="docs-header">
      <div class="docs-header-inner">
        <Button class="docs-brand" color="text" size="medium" :href="resolveLink('/')">
          <img v-if="siteLogo" class="docs-brand-logo" :src="siteLogo" alt="" />
          <span class="docs-brand-text">{{ siteTitle }}</span>
        </Button>

        <nav class="docs-nav" aria-label="Primary">
          <Button
            v-for="item in navItems"
            :key="item.link"
            class="docs-nav-link"
            color="text"
            size="medium"
            :href="resolveLink(item.link)"
            :data-active="isActiveLink(item.link) ? 'true' : 'false'"
          >
            {{ item.text }}
          </Button>
        </nav>

        <div class="docs-header-actions">
          <Button
            v-for="link in socialLinks"
            :key="link.link"
            class="docs-social-link"
            color="text"
            size="small"
            :href="link.link"
            trailing-icon="open_in_new"
          >
            {{ resolveSocialLabel(link.link) }}
          </Button>

          <IconButton
            class="docs-action-icon"
            color="standard"
            size="small"
            width="default"
            :icon="isDark ? 'light_mode' : 'dark_mode'"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleAppearance"
          />

          <IconButton
            class="docs-menu-toggle"
            color="standard"
            size="small"
            width="default"
            icon="menu"
            aria-label="Toggle sidebar"
            @click="toggleSidebar"
          />
        </div>
      </div>
    </header>

    <div class="docs-shell">
      <aside class="docs-sidebar" :data-open="isSidebarOpen ? 'true' : 'false'">
        <Card color="filled" class="docs-sidebar-card">
          <nav class="docs-sidebar-nav" aria-label="Sidebar">
            <section v-for="group in sidebarGroups" :key="group.text || 'group'" class="docs-sidebar-group">
              <h2 v-if="group.text" class="docs-sidebar-title">{{ group.text }}</h2>

              <div class="docs-sidebar-links">
                <Button
                  v-for="item in group.items"
                  :key="item.link"
                  class="docs-sidebar-link"
                  color="text"
                  size="medium"
                  :href="resolveLink(item.link)"
                  :data-active="isActiveLink(item.link) ? 'true' : 'false'"
                >
                  {{ item.text }}
                </Button>
              </div>
            </section>
          </nav>
        </Card>
      </aside>

      <main class="docs-main">
        <template v-if="showHomeLayout && hero">
          <Card color="filled" class="docs-hero">
            <div class="docs-hero-content">
              <p class="docs-hero-eyebrow">{{ hero.name || siteTitle }}</p>
              <h1 class="docs-hero-title">{{ hero.text }}</h1>
              <p class="docs-hero-tagline">{{ hero.tagline }}</p>

              <div class="docs-hero-actions">
                <Button
                  v-for="action in (hero.actions as HeroAction[] | undefined) ?? []"
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

          <div class="docs-home-content">
            <Content />
          </div>
        </template>

        <template v-else>
          <article class="docs-page-card">
            <Content />
          </article>

          <nav
            v-if="previousItem || nextItem"
            class="docs-pager"
            aria-label="Page navigation"
          >
            <Button
              v-if="previousItem"
              color="outlined"
              size="medium"
              :href="resolveLink(previousItem.link)"
              leading-icon="arrow_back"
            >
              {{ previousItem.text }}
            </Button>

            <span v-else class="docs-pager-spacer" />

            <Button
              v-if="nextItem"
              color="tonal"
              size="medium"
              :href="resolveLink(nextItem.link)"
              trailing-icon="arrow_forward"
            >
              {{ nextItem.text }}
            </Button>
          </nav>
        </template>
      </main>

      <aside v-if="!showHomeLayout && outlineItems.length" class="docs-outline">
        <Card color="outlined" class="docs-outline-card">
          <h2 class="docs-outline-title">On This Page</h2>

          <nav class="docs-outline-links" aria-label="On this page">
            <Button
              v-for="item in outlineItems"
              :key="item.link"
              class="docs-outline-link"
              color="text"
              size="small"
              :href="item.link"
              :style="{ '--outline-depth': item.depth }"
            >
              {{ item.title }}
            </Button>
          </nav>
        </Card>
      </aside>
    </div>
  </div>

  <Content v-else />
</template>

<style scoped>
.docs-layout {
  min-block-size: 100vh;
  background:
    radial-gradient(circle at top, --translucent(var(--md-sys-color-primary), 0.12), transparent 28rem),
    linear-gradient(180deg, var(--vp-c-bg-alt) 0%, var(--vp-c-bg) 18rem);
}

.docs-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: --translucent(#000000, 0.28);
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease;
}

.docs-backdrop[data-open='true'] {
  opacity: 1;
  pointer-events: auto;
}

.docs-header {
  position: sticky;
  inset-block-start: 0;
  z-index: 30;
  padding-block: --dp(12);
  padding-inline: --dp(16);
  backdrop-filter: blur(20px);
}

.docs-header-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: --dp(12);
  align-items: center;
  max-inline-size: 96rem;
  margin-inline: auto;
  border: 1px solid --translucent(var(--vp-c-divider), 0.7);
  border-radius: --dp(28);
  padding-block: --dp(10);
  padding-inline: --dp(12);
  background: --translucent(var(--vp-c-bg), 0.78);
}

.docs-brand:deep(.m3-button) {
  gap: --dp(10);
}

.docs-brand-logo {
  inline-size: --dp(24);
  block-size: --dp(24);
}

.docs-brand-text {
  font-size: --dp(16);
  font-weight: 700;
}

.docs-nav {
  display: flex;
  flex-wrap: wrap;
  gap: --dp(8);
  justify-content: center;
}

.docs-nav-link[data-active='true']:deep(.m3-button),
.docs-sidebar-link[data-active='true']:deep(.m3-button),
.docs-outline-link:deep(.m3-button:hover) {
  color: var(--md-sys-color-primary);
}

.docs-nav-link[data-active='true']:deep(.m3-button),
.docs-sidebar-link[data-active='true']:deep(.m3-button) {
  background: --translucent(var(--md-sys-color-primary), 0.12);
}

.docs-header-actions {
  display: flex;
  align-items: center;
  gap: --dp(8);
}

.docs-menu-toggle {
  display: none;
}

.docs-shell {
  display: grid;
  grid-template-columns: minmax(0, 17rem) minmax(0, 1fr) minmax(0, 15rem);
  gap: --dp(20);
  max-inline-size: 96rem;
  margin-inline: auto;
  padding-inline: --dp(16);
  padding-block-end: --dp(24);
}

.docs-sidebar,
.docs-outline {
  position: sticky;
  inset-block-start: 6rem;
  block-size: fit-content;
}

.docs-sidebar-card,
.docs-outline-card,
.docs-hero,
.docs-page-card {
  display: block;
}

.docs-sidebar-card:deep(.m3-card),
.docs-outline-card:deep(.m3-card),
.docs-hero:deep(.m3-card),
.docs-page-card:deep(.m3-card) {
  border-radius: --dp(28);
  overflow: clip;
}

.docs-sidebar-nav,
.docs-outline-card,
.docs-hero,
.docs-page-card {
  padding: --dp(20);
}

.docs-sidebar-group {
  display: grid;
  gap: --dp(8);
}

.docs-sidebar-group + .docs-sidebar-group {
  margin-block-start: --dp(20);
}

.docs-sidebar-title,
.docs-outline-title,
.docs-hero-eyebrow,
.docs-hero-title,
.docs-hero-tagline {
  margin: 0;
}

.docs-sidebar-title,
.docs-outline-title {
  color: var(--vp-c-text-2);
  font-size: --dp(13);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.docs-sidebar-links,
.docs-outline-links {
  display: grid;
  gap: --dp(6);
}

.docs-main {
  min-inline-size: 0;
}

.docs-page-card {
  margin-block-end: --dp(20);
}

.docs-hero {
  margin-block-end: --dp(24);
}

.docs-hero-content {
  display: grid;
  gap: --dp(16);
  padding: --dp(32);
}

.docs-hero-eyebrow {
  color: var(--vp-c-text-2);
  font-size: --dp(14);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.docs-hero-title {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1;
}

.docs-hero-tagline {
  max-inline-size: 40rem;
  color: var(--vp-c-text-2);
  font-size: --dp(18);
  line-height: 1.6;
}

.docs-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: --dp(12);
}

.docs-home-content {
  display: grid;
  gap: --dp(16);
}

.docs-pager {
  display: flex;
  justify-content: space-between;
  gap: --dp(12);
}

.docs-pager-spacer {
  flex: 1;
}

.docs-outline-link {
  justify-self: stretch;
}

.docs-outline-link:deep(.m3-button) {
  justify-content: flex-start;
  inline-size: 100%;
  padding-inline-start: calc(--dp(12) + var(--outline-depth) * --dp(12));
}

@media (max-width: 80rem) {
  .docs-shell {
    grid-template-columns: minmax(0, 17rem) minmax(0, 1fr);
  }

  .docs-outline {
    display: none;
  }
}

@media (max-width: 64rem) {
  .docs-header-inner {
    grid-template-columns: auto 1fr auto;
  }

  .docs-nav,
  .docs-social-link {
    display: none;
  }

  .docs-menu-toggle {
    display: inline-flex;
  }

  .docs-shell {
    grid-template-columns: 1fr;
  }

  .docs-sidebar {
    position: fixed;
    inset-block: 0;
    inset-inline-start: 0;
    z-index: 25;
    inline-size: min(88vw, 20rem);
    padding: --dp(16);
    transform: translateX(-100%);
    transition: transform 180ms ease;
  }

  .docs-sidebar[data-open='true'] {
    transform: translateX(0);
  }
}
</style>
