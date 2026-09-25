---
title: NavigationDrawer
---

<script setup lang="ts">
import { ref } from 'vue';
import { NavigationDrawer, NavigationDrawerItem, NavigationDrawerSection } from '@/components/NavigationDrawer';

import NavigationDrawerDefault from '../../demos/navigation-drawer/NavigationDrawerDefault.vue';
import NavigationDrawerDefaultSrc from '../../demos/navigation-drawer/NavigationDrawerDefault.vue?raw';
import NavigationDrawerIconOnly from '../../demos/navigation-drawer/NavigationDrawerIconOnly.vue';
import NavigationDrawerIconOnlySrc from '../../demos/navigation-drawer/NavigationDrawerIconOnly.vue?raw';
import NavigationDrawerPlain from '../../demos/navigation-drawer/NavigationDrawerPlain.vue';
import NavigationDrawerPlainSrc from '../../demos/navigation-drawer/NavigationDrawerPlain.vue?raw';

const props = ref({
  ariaLabel: 'Primary destinations',
  disabled: false,
  iconSpace: 'root',
  iconOnly: false,
  shape: 'rounded',
});

const value = ref('home');
</script>

# NavigationDrawer

NavigationDrawer 提供纵向导航目标，其中的条目可供选择，分区可展开。
顶层图标条目和纯文本条目需要共用标签列时，使用 `iconSpace="root"`。
紧凑导航抽屉可使用 `iconOnly`：界面仅显示前置图标，同时向辅助技术提供标签，并以工具提示展示标签。
使用 `shape` 设置条目和分区触发器的默认形状；单个 `NavigationDrawerItem` 可以覆盖此设置。

<DemoContainer><NavigationDrawer v-model="value" v-bind="props" style="block-size: 30rem"><NavigationDrawerItem value="home" icon="home" label="主页" /><NavigationDrawerItem value="inbox" icon="inbox" label="收件箱" /><NavigationDrawerSection icon="folder" label="项目"><NavigationDrawerItem value="active" icon="task_alt" label="进行中" /><NavigationDrawerItem value="archived" icon="archive" label="已归档" /></NavigationDrawerSection><NavigationDrawerSection icon="groups" label="团队"><NavigationDrawerItem value="design" icon="palette" label="设计" /><NavigationDrawerItem value="engineering" icon="engineering" label="工程" /></NavigationDrawerSection><NavigationDrawerSection icon="list" label="纯文本"><NavigationDrawerItem value="drafts" icon="draft" label="草稿" /><NavigationDrawerItem value="sent" icon="send" label="已发送" /></NavigationDrawerSection><NavigationDrawerItem value="settings" icon="settings" label="设置" /></NavigationDrawer></DemoContainer>

<AnatomyTable scope="navigation-drawer" />

<AnatomyTable scope="navigation-drawer-item" />

<AnatomyTable scope="navigation-drawer-section" />

<ApiTable component="NavigationDrawer" v-model="props" />

<StyleTokenTable component="NavigationDrawer" />

## 示例

### 默认

<DemoContainer :src="NavigationDrawerDefaultSrc"><NavigationDrawerDefault /></DemoContainer>

### 无图标

<DemoContainer :src="NavigationDrawerPlainSrc"><NavigationDrawerPlain /></DemoContainer>

### 仅图标

<DemoContainer :src="NavigationDrawerIconOnlySrc"><NavigationDrawerIconOnly /></DemoContainer>

## API

### NavigationDrawer

<ApiTable component="NavigationDrawer" />

### NavigationDrawerItem

<ApiTable component="NavigationDrawerItem" />

### NavigationDrawerSection

<ApiTable component="NavigationDrawerSection" />
