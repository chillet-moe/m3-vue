import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useLocaleNavigation } from './nav';

const data = {
  lang: ref('zh-Hans'),
  site: ref({
    cleanUrls: true,
    locales: {
      root: { label: 'English', lang: 'en-US' },
      'zh-Hans': { label: '简体中文', lang: 'zh-Hans' },
      ja: { label: '日本語', lang: 'ja' },
    },
  }),
  localeIndex: ref('zh-Hans'),
  page: ref({ relativePath: 'zh-Hans/components/button.md' }),
  hash: ref('#usage'),
  theme: ref({ i18nRouting: true }),
};
vi.mock('vitepress', () => ({ useData: () => data, withBase: (path: string) => path }));

describe('locale navigation', () => {
  it('lists configured languages and preserves the corresponding page and hash', () => {
    const nav = useLocaleNavigation();
    expect(nav.languages.value.map(({ link, current }) => ({ link, current }))).toEqual([
      { link: '/components/button#usage', current: false },
      { link: '/zh-Hans/components/button#usage', current: true },
      { link: '/ja/components/button#usage', current: false },
    ]);
    data.localeIndex.value = 'ja';
    data.page.value.relativePath = 'ja/index.md';
    data.hash.value = '';
    expect(nav.homeLink.value).toBe('/ja/');
    expect(nav.localizePath('/getting-started')).toBe('/ja/getting-started');
    expect(nav.languages.value.map(({ link }) => link)).toEqual(['/', '/zh-Hans/', '/ja/']);
    data.site.value.cleanUrls = false;
    data.page.value.relativePath = 'ja/components/button.md';
    expect(nav.languages.value[0]?.link).toBe('/components/button.html');
    data.theme.value.i18nRouting = false;
    expect(nav.languages.value.map(({ link }) => link)).toEqual(['/', '/zh-Hans/', '/ja/']);
  });
});
