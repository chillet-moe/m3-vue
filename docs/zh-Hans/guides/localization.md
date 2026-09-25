---
title: 本地化
---

# 本地化

m3-vue 使用区域设置定义内置的可见文本和无障碍文本。默认语言为英语。简体中文和繁体中文有各自独立的入口，因此应用只会打包实际导入的语言。
未配置区域设置时，月份和星期名称等依赖区域设置的格式会使用浏览器默认区域，而内置消息仍使用英语。

## 配置应用

向插件传入区域设置定义：

```ts
import { shallowRef } from 'vue';
import { M3VuePlugin, type M3LocaleDefinition } from '@chillet/m3-vue';
import { zhHans } from '@chillet/m3-vue/locales/zh-Hans';

const locale = shallowRef<M3LocaleDefinition>(zhHans);

app.use(M3VuePlugin, { locale });
```

此选项接受 ref、computed ref 或 getter。赋入另一个已导入的区域设置定义，即可在运行时切换整个应用的语言：

```ts
import { en } from '@chillet/m3-vue/locales/en';
import { zhHant } from '@chillet/m3-vue/locales/zh-Hant';

locale.value = zhHant;
locale.value = en;
```

从对应的包入口导入区域设置定义：

- `@chillet/m3-vue/locales/en`
- `@chillet/m3-vue/locales/zh-Hans`
- `@chillet/m3-vue/locales/zh-Hant`

## 配置组件子树

在拥有该子树的 setup 作用域中调用 `provideM3Locale`。未指定的配置值会从最近的父级配置继承：

```vue
<script setup lang="ts">
import { shallowRef } from 'vue';
import { provideM3Locale, type M3LocaleDefinition } from '@chillet/m3-vue';
import { zhHant } from '@chillet/m3-vue/locales/zh-Hant';

const locale = shallowRef<M3LocaleDefinition>(zhHant);
provideM3Locale({ locale });
</script>
```

对于需要直接调用 Vue `provide` 的应用，也导出了 `m3LocaleContextKey` 和 `createM3LocaleContext`。

## 区域设置字符串和消息覆盖

BCP 47 字符串可以更改依赖区域设置的格式和筛选行为，而无需导入另一套消息目录：

```ts
app.use(M3VuePlugin, { locale: 'en-GB' });
```

此时，消息仍使用继承的目录或内置英语回退。使用 `messages` 可进行带类型的部分覆盖：

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

`confirmText`、`ariaLabel` 和 `filterNoResultsText` 等显式组件属性优先于本地化默认值。
