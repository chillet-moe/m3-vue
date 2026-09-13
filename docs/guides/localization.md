---
title: Localization
---

# Localization

m3-vue uses locale definitions for its built-in visible and accessibility text. English is the default. Simplified
and Traditional Chinese are separate entry points so applications only bundle the languages they import.
When no locale is configured, locale-sensitive formatting such as month and weekday names uses the browser's
default locale, while built-in messages continue to use English.

## Configure The Application

Pass a locale definition to the plugin:

```ts
import { shallowRef } from 'vue';
import { M3VuePlugin, type M3LocaleDefinition } from '@chillet/m3-vue';
import { zhHans } from '@chillet/m3-vue/locales/zh-Hans';

const locale = shallowRef<M3LocaleDefinition>(zhHans);

app.use(M3VuePlugin, { locale });
```

The option accepts a ref, computed ref, or getter. Assign another imported locale definition to switch the whole
application at runtime:

```ts
import { en } from '@chillet/m3-vue/locales/en';
import { zhHant } from '@chillet/m3-vue/locales/zh-Hant';

locale.value = zhHant;
locale.value = en;
```

Import locale definitions from their dedicated package entry points:

- `@chillet/m3-vue/locales/en`
- `@chillet/m3-vue/locales/zh-Hans`
- `@chillet/m3-vue/locales/zh-Hant`

## Configure A Component Subtree

Call `provideM3Locale` in the setup scope that owns the subtree. The provided configuration inherits unspecified
values from the nearest parent configuration:

```vue
<script setup lang="ts">
import { shallowRef } from 'vue';
import { provideM3Locale, type M3LocaleDefinition } from '@chillet/m3-vue';
import { zhHant } from '@chillet/m3-vue/locales/zh-Hant';

const locale = shallowRef<M3LocaleDefinition>(zhHant);
provideM3Locale({ locale });
</script>
```

`m3LocaleContextKey` and `createM3LocaleContext` are exported for applications that need to call Vue's `provide`
directly.

## Locale Strings And Message Overrides

A BCP 47 string changes locale-sensitive formatting and filtering without importing another message catalog:

```ts
app.use(M3VuePlugin, { locale: 'en-GB' });
```

In this case, messages continue to use the inherited catalog or the built-in English fallback. Use `messages` for
typed partial overrides:

```ts
app.use(M3VuePlugin, {
  locale: 'en-GB',
  messages: {
    common: {
      confirm: 'Apply',
    },
  },
});
```

Explicit component props such as `confirmText`, `ariaLabel`, and `filterNoResultsText` take precedence over localized
defaults.
