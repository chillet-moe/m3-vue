import type { DefaultTheme } from 'vitepress';
import { useData, withBase } from 'vitepress';
import { computed } from 'vue';

import type { HeroAction, ThemeNavItem, ThemeSocialLink } from '../utils';

export function useLocaleNavigation() {
  const { lang, site, localeIndex, page, hash, theme } = useData();
  const isChinese = computed(() => lang.value === 'zh-Hans');
  const localeRoot = (key: string) => site.value.locales[key]?.link || (key === 'root' ? '/' : `/${key}/`);
  const homeLink = computed(() => localeRoot(localeIndex.value));
  const languages = computed(() => {
    const relativePath = page.value.relativePath
      .slice(homeLink.value.length - 1)
      .replace(/(^|\/)index\.md$/, '$1')
      .replace(/\.md$/, site.value.cleanUrls ? '' : '.html');
    return Object.entries(site.value.locales).map(([key, locale]) => ({
      key,
      label: locale.label,
      lang: locale.lang,
      dir: locale.dir,
      current: key === localeIndex.value,
      link:
        theme.value.i18nRouting === false
          ? localeRoot(key)
          : `${localeRoot(key).replace(/\/$/, '')}/${relativePath}${hash.value}`,
    }));
  });

  function localizePath(path: string) {
    return `${homeLink.value.replace(/\/$/, '')}${path}`;
  }

  return { isChinese, homeLink, languages, localizePath };
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
