import type { DefaultTheme } from 'vitepress';

export type ThemeNavItem = {
  text: string;
  link: string;
};

export type ThemeSocialLink = {
  icon?: string;
  link: string;
};

export type ThemeSidebarLink = {
  text: string;
  link: string;
};

export type ThemeOutlineLink = {
  title: string;
  link: string;
  depth: number;
  element?: HTMLHeadElement;
};

export type HeroAction = {
  theme?: 'brand' | 'alt';
  text: string;
  link: string;
};

export function normalizePath(path: string) {
  if (!path) {
    return '/';
  }

  let normalizedPath = path.replace(/\.html$/, '');

  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  return normalizedPath || '/';
}

export function resolveSocialLabel(link: string) {
  if (link.includes('github.com')) {
    return 'GitHub';
  }

  return 'External';
}

export function mapHeroActionColor(actionTheme?: 'brand' | 'alt') {
  if (actionTheme === 'brand') {
    return 'filled';
  }

  if (actionTheme === 'alt') {
    return 'outlined';
  }

  return 'text';
}

export function flattenSidebarLinks(items: DefaultTheme.SidebarItem[]): ThemeSidebarLink[] {
  return items.flatMap((item) => {
    if (item.items?.length) {
      return flattenSidebarLinks(item.items);
    }

    if (item.link && item.text) {
      return [{ text: item.text, link: item.link }];
    }

    return [];
  });
}

export function flattenOutlineItems(
  items: Array<
    | DefaultTheme.OutlineItem
    | {
        title: string;
        link?: string;
        slug?: string;
        children?: Array<{
          title: string;
          link?: string;
          slug?: string;
          children?: unknown[];
        }>;
      }
  >,
  depth = 0,
): ThemeOutlineLink[] {
  return items.flatMap((item) => {
    const link = 'link' in item && typeof item.link === 'string' ? item.link : 'slug' in item ? `#${item.slug}` : '';
    const element =
      'element' in item && item.element instanceof HTMLElement
        ? (item.element as HTMLHeadElement)
        : link.startsWith('#')
          ? (document.getElementById(link.slice(1)) as HTMLHeadElement | null) ?? undefined
          : undefined;

    return [
      {
        title: item.title,
        link,
        depth,
        element,
      },
      ...flattenOutlineItems((item.children ?? []) as ThemeOutlineLink[], depth + 1),
    ];
  });
}

export function resolveSidebarItems(
  sidebar: DefaultTheme.Config['sidebar'],
  relativePath: string,
): DefaultTheme.SidebarItem[] {
  if (Array.isArray(sidebar)) {
    return addSidebarBase(sidebar);
  }

  if (!sidebar) {
    return [];
  }

  const path = ensureStartingSlash(relativePath);
  const matchedKey = Object.keys(sidebar)
    .sort((left, right) => right.split('/').length - left.split('/').length)
    .find((key) => path.startsWith(ensureStartingSlash(key)));

  if (!matchedKey) {
    return [];
  }

  const matchedSidebar = sidebar[matchedKey];
  return Array.isArray(matchedSidebar)
    ? addSidebarBase(matchedSidebar)
    : addSidebarBase(matchedSidebar.items, matchedSidebar.base);
}

function ensureStartingSlash(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

function addSidebarBase(items: DefaultTheme.SidebarItem[], inheritedBase?: string): DefaultTheme.SidebarItem[] {
  return items.map((item) => {
    const base = item.base || inheritedBase;
    const nextItem: DefaultTheme.SidebarItem = { ...item };

    if (base && nextItem.link) {
      nextItem.link = base + nextItem.link.replace(/^\//, base.endsWith('/') ? '' : '/');
    }

    if (nextItem.items?.length) {
      nextItem.items = addSidebarBase(nextItem.items, base);
    }

    return nextItem;
  });
}
