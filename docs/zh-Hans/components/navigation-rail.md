---
title: NavigationRail
---

<script setup lang="ts">
import { ref } from 'vue';
import { NavigationRail, NavigationRailItem } from '@/components/NavigationRail';

import NavigationRailDefault from '../../demos/navigation-rail/NavigationRailDefault.vue';
import NavigationRailDefaultSrc from '../../demos/navigation-rail/NavigationRailDefault.vue?raw';
import NavigationRailLinks from '../../demos/navigation-rail/NavigationRailLinks.vue';
import NavigationRailLinksSrc from '../../demos/navigation-rail/NavigationRailLinks.vue?raw';
import NavigationRailStates from '../../demos/navigation-rail/NavigationRailStates.vue';
import NavigationRailStatesSrc from '../../demos/navigation-rail/NavigationRailStates.vue?raw';

const props = ref({
  ariaLabel: 'Primary destinations',
  disabled: false,
  state: 'collapsed',
});

const value = ref('home');
</script>

# NavigationRail

NavigationRail 通过 `NavigationRailItem` 提供纵向主要导航目标，并内置 `collapsed` 与 `expanded` 状态切换。

<DemoContainer><NavigationRail v-model="value" v-bind="props" style="block-size: 28rem"><NavigationRailItem value="home" icon="home" label="主页" /><NavigationRailItem value="bookmarks" icon="bookmark" label="已保存" /><NavigationRailItem value="folder" icon="folder" label="文件" /><NavigationRailItem value="settings" icon="settings" label="设置" /></NavigationRail></DemoContainer>

## 示例

### 默认

<DemoContainer :src="NavigationRailDefaultSrc"><NavigationRailDefault /></DemoContainer>

### 带链接

<DemoContainer :src="NavigationRailLinksSrc"><NavigationRailLinks /></DemoContainer>

### 状态切换

<DemoContainer :src="NavigationRailStatesSrc"><NavigationRailStates /></DemoContainer>

## 参考

<AnatomyTable scope="navigation-rail" />

<AnatomyTable scope="navigation-rail-item" />

<ApiTable component="NavigationRail" v-model="props" />

<StyleTokenTable component="NavigationRail" />

### NavigationRailItem

<ApiTable component="NavigationRailItem" />
