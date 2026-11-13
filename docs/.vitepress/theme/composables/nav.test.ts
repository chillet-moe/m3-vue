import { describe, expect, it, vi } from 'vitest';
import { reactive, ref } from 'vue';
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
  theme: ref({ i18nRouting: true }),
};
const route = reactive({ hash: '#usage' });
vi.mock('vitepress', () => ({ useData: () => data, useRoute: () => route, withBase: (path: string) => path }));

describe('locale navigation', () => {
  it('lists configured languages and preserves the corresponding page and hash', () => {
    const nav = useLocaleNavigation();
    expect(nav.languages.value.map(({ link, current }) => ({ link, current }))).toEqual([
      { link: '/components/button#usage', current: false },
      { link: '/zh-Hans/components/button#usage', current: true },
      { link: '/ja/components/button#usage', current: false },
    ]);
    route.hash = '#用法';
    expect(nav.languages.value[0]?.link).toBe('/components/button#%E7%94%A8%E6%B3%95');

    data.localeIndex.value = 'ja';
    data.page.value.relativePath = 'ja/index.md';
    route.hash = '';
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
