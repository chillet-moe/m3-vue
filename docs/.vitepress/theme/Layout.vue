<script setup lang="ts">
import type { DefaultTheme } from 'vitepress';
import { Content, useData, useRoute, withBase } from 'vitepress';
import { useLayout } from 'vitepress/theme';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import DocsOutline from './components/DocsOutline.vue';
import DocsPager from './components/DocsPager.vue';
import DocsSidebar from './components/DocsSidebar.vue';
import DocsTopBar from './components/DocsTopBar.vue';
import HomeLayout from './components/HomeLayout.vue';
import NotFoundView from './components/NotFoundView.vue';
import {
  flattenOutlineItems,
  flattenSidebarLinks,
  normalizePath,
  resolveSidebarItems,
  type HeroAction,
  type ThemeNavItem,
  type ThemeSocialLink,
} from './utils';

const { site, theme, page, frontmatter, isDark } = useData();
const route = useRoute();
const isSidebarOpen = ref(false);
const activeHeadingId = ref('');
let observer: IntersectionObserver | null = null;

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
  const nav = theme.value.nav as DefaultTheme.NavItem[] | undefined;
  return Array.isArray(nav)
    ? nav.filter((item): item is ThemeNavItem => {
        return 'text' in item && 'link' in item && typeof item.text === 'string' && typeof item.link === 'string';
      })
    : [];
});

const socialLinks = computed<ThemeSocialLink[]>(() => {
  return Array.isArray(theme.value.socialLinks) ? (theme.value.socialLinks as ThemeSocialLink[]) : [];
});

const sidebarItems = computed(() => {
  return resolveSidebarItems(theme.value.sidebar, page.value.relativePath);
});

const flatSidebarItems = computed(() => {
  return flattenSidebarLinks(sidebarItems.value);
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

const outlineItems = computed(() => {
  return flattenOutlineItems(page.value.headers ?? []);
});

const outlineLabel = computed(() => {
  const outline = theme.value.outline;

  if (outline && typeof outline === 'object' && typeof outline.label === 'string') {
    return outline.label;
  }

  if (typeof theme.value.outlineTitle === 'string') {
    return theme.value.outlineTitle;
  }

  return 'On This Page';
});

const showHomeLayout = computed(() => {
  return frontmatter.value.layout === 'home';
});

const hero = computed(() => {
  return typeof frontmatter.value.hero === 'object' && frontmatter.value.hero
    ? (frontmatter.value.hero as {
        name?: string;
        text?: string;
        tagline?: string;
        actions?: HeroAction[];
      })
    : null;
});

const siteLogo = computed(() => {
  if (typeof theme.value.logo === 'string') {
    return withBase(theme.value.logo);
  }

  if (theme.value.logo && typeof theme.value.logo === 'object') {
    const lightLogo = 'light' in theme.value.logo ? theme.value.logo.light : undefined;
    const darkLogo = 'dark' in theme.value.logo ? theme.value.logo.dark : undefined;
    const resolvedLogo = isDark.value ? darkLogo ?? lightLogo : lightLogo ?? darkLogo;
    return typeof resolvedLogo === 'string' ? withBase(resolvedLogo) : undefined;
  }

  return undefined;
});

const siteTitle = computed(() => {
  return site.value.title || 'M3 Vue';
});

const pageTitle = computed(() => {
  return page.value.title || frontmatter.value.title || siteTitle.value;
});

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function closeSidebar() {
  isSidebarOpen.value = false;
}

function toggleAppearance() {
  isDark.value = !isDark.value;
}

function setupScrollSpy() {
  cleanupScrollSpy();

  const headings = outlineItems.value
    .map((item) => item.element)
    .filter((element): element is HTMLHeadElement => Boolean(element));

  if (!headings.length) {
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

      if (!visibleEntries.length) {
        return;
      }

      activeHeadingId.value = visibleEntries[0].target.id;
    },
    {
      rootMargin: '-96px 0px -70% 0px',
    },
  );

  headings.forEach((heading) => {
    observer?.observe(heading);
  });
}

function cleanupScrollSpy() {
  observer?.disconnect();
  observer = null;
}

onMounted(() => {
  void nextTick(() => setupScrollSpy());
});

onUnmounted(() => {
  cleanupScrollSpy();
});

watch(
  () => route.path,
  () => {
    activeHeadingId.value = '';
    void nextTick(() => setupScrollSpy());
  },
);
</script>

<template>
  <div v-if="frontmatter.layout !== false" class="docs-app" :class="[frontmatter.pageClass, { 'docs-layout-home': showHomeLayout }]">
    <template v-if="page.isNotFound">
      <HomeLayout
        :is-dark="isDark"
        :nav-items="navItems"
        :site-logo="siteLogo"
        :site-title="siteTitle"
        :social-links="socialLinks"
        @toggle-appearance="toggleAppearance"
      >
        <NotFoundView />
      </HomeLayout>
    </template>

    <template v-else-if="showHomeLayout">
      <HomeLayout
        :hero="hero"
        :is-dark="isDark"
        :nav-items="navItems"
        :site-logo="siteLogo"
        :site-title="siteTitle"
        :social-links="socialLinks"
        @toggle-appearance="toggleAppearance"
      >
        <Content />
      </HomeLayout>
    </template>

    <template v-else>
      <div
        class="docs-backdrop"
        :data-open="isSidebarOpen ? 'true' : 'false'"
        @click="closeSidebar"
      />

      <div class="docs-layout">
        <DocsSidebar
          :current-path="currentPath"
          :is-open="isSidebarOpen"
          :sidebar-items="sidebarItems"
          :site-logo="siteLogo"
          :site-title="siteTitle"
          @close="closeSidebar"
        />

        <div class="docs-main-shell">
          <DocsTopBar
            :current-path="currentPath"
            :is-dark="isDark"
            :nav-items="navItems"
            :page-title="pageTitle"
            :social-links="socialLinks"
            @toggle-appearance="toggleAppearance"
            @toggle-sidebar="toggleSidebar"
          />

          <div class="docs-content-shell">
            <main class="docs-main">
              <article class="docs-page-card vp-doc">
                <Content />
              </article>

              <DocsPager :previous-item="previousItem" :next-item="nextItem" />
            </main>

            <DocsOutline
              v-if="outlineItems.length"
              :active-heading-id="activeHeadingId"
              :items="outlineItems"
              :title="outlineLabel"
            />
          </div>
        </div>
      </div>
    </template>
  </div>

  <Content v-else />
</template>

<style scoped>
.docs-app {
  min-block-size: 100vh;
}

.docs-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: --translucent(#000000, 0.28);
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease;
}

.docs-backdrop[data-open='true'] {
  opacity: 1;
  pointer-events: auto;
}

.docs-layout {
  display: grid;
  grid-template-columns: 18rem minmax(0, 1fr);
  min-block-size: 100vh;
}

.docs-main-shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-inline-size: 0;
  background:
    radial-gradient(circle at top, --translucent(var(--md-sys-color-primary), 0.12), transparent 28rem),
    linear-gradient(180deg, var(--vp-c-bg-alt) 0%, var(--vp-c-bg) 18rem);
}

.docs-content-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16rem;
  align-items: start;
}

.docs-main {
  display: grid;
  gap: --dp(20);
  padding: --dp(20) --dp(24) --dp(32);
}

.docs-page-card {
  display: block;
  max-inline-size: 60rem;
  inline-size: 100%;
  margin-inline: auto;
  padding: --dp(20);
  border-radius: --dp(28);
  background: var(--vp-c-bg);
}

@media (max-width: 80rem) {
  .docs-content-shell {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 64rem) {
  .docs-layout {
    grid-template-columns: 1fr;
  }

  .docs-main {
    padding-inline: --dp(16);
  }
}
</style>
