import type { DefaultTheme } from 'vitepress';
import { useData, useRoute, withBase } from 'vitepress';
import { computed } from 'vue';

import { normalizePath, type HeroAction, type ThemeNavItem, type ThemeSocialLink } from '../utils';

export function useLocaleNavigation() {
  const { lang } = useData();
  const route = useRoute();
  const isChinese = computed(() => lang.value === 'zh-Hans');
  const homeLink = computed(() => (isChinese.value ? '/zh-Hans/' : '/'));
  const languageLink = computed(() => {
    const currentPath = normalizePath(route.path);
    const englishPath = isChinese.value ? currentPath.replace(/^\/zh-Hans(?=\/|$)/, '') || '/' : currentPath;

    return isChinese.value ? englishPath : `/zh-Hans${englishPath === '/' ? '/' : englishPath}`;
  });

  function localizePath(path: string) {
    return isChinese.value ? `/zh-Hans${path === '/' ? '/' : path}` : path;
  }

  return { isChinese, homeLink, languageLink, localizePath };
}

export function useNav() {
  const { theme } = useData();

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

  return { navItems, socialLinks };
}

export function useSiteInfo() {
  const { site, theme, isDark } = useData();

  const siteLogo = computed(() => {
    if (typeof theme.value.logo === 'string') {
      return withBase(theme.value.logo);
    }

    if (theme.value.logo && typeof theme.value.logo === 'object') {
      const lightLogo = 'light' in theme.value.logo ? theme.value.logo.light : undefined;
      const darkLogo = 'dark' in theme.value.logo ? theme.value.logo.dark : undefined;
      const resolvedLogo = isDark.value ? (darkLogo ?? lightLogo) : (lightLogo ?? darkLogo);
      return typeof resolvedLogo === 'string' ? withBase(resolvedLogo) : undefined;
    }

    return undefined;
  });

  const siteTitle = computed(() => site.value.title || 'M3 Vue');

  return { siteLogo, siteTitle };
}

export function useHero() {
  const { frontmatter } = useData();

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

  return { hero };
}
