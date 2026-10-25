<script setup lang="ts">
import { ref } from 'vue';
import { Button, TextField, Select, ListItem, Tabs, TabList, Tab, Chip } from '@/index';
const compact = new URLSearchParams(location.search).has('compact');
const category = ref('general');
const tab = ref('settings');
const options = [
  { value: 'general', label: '常规设置 · General settings' },
  { value: 'advanced', label: '高级设置 · Advanced settings' },
  { value: 'other', label: '其他设置 · Other settings' },
];
</script>

<template>
  <main class="workspace">
    <header>
      <p class="eyebrow">M3 VUE · TYPOGRAPHY</p>
      <h1>{{ compact ? '紧凑排版 / Compact' : '默认排版 / Default' }}</h1>
      <p>32px controls · 中文与 English</p>
    </header>
    <section class="panel">
      <Tabs v-model="tab" size="extra-small">
        <TabList>
          <Tab value="settings">设置 Settings</Tab>
          <Tab value="properties">属性 Properties</Tab>
        </TabList>
      </Tabs>
      <div class="content">
        <h2>显示设置 · Display settings</h2>
        <div class="actions">
          <Button size="extra-small" variant="outlined">应用 Apply</Button>
          <Button size="extra-small">重置 Reset</Button>
          <Button size="extra-small" disabled>恢复 Restore</Button>
        </div>
        <TextField size="extra-small" label="名称 / Name" model-value="示例名称 · Sample name" />
        <Select
          v-model="category"
          size="extra-small"
          label="分类 / Category"
          :options="options"
          :show-selected-icon="false"
        >
        </Select>
        <TextField size="extra-small" label="缩放 / Scale" model-value="100" supporting-text="可用范围 · Range 50–200%"
          ><template #suffix>%</template></TextField
        >
        <div class="items">
          <ListItem title="常规设置 · General settings" description="语言与外观 · Language and appearance" />
          <ListItem title="高级设置 · Advanced settings" description="快捷键与通知 · Shortcuts and notifications" />
        </div>
        <div class="actions">
          <Chip>已启用 Enabled</Chip><span class="supporting">2 个设置分组 · 2 settings groups</span>
        </div>
      </div>
      <footer><span>就绪 Ready</span><span>已保存 · Saved</span></footer>
    </section>
  </main>
</template>

<style>
body {
  margin: 0;
  background: #f3f1f7;
  color: #26232b;
  font-family: 'Noto Sans CJK SC', sans-serif;
}
.workspace {
  width: min(100% - 48px, 560px);
  margin: 32px auto;
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}
header {
  margin-bottom: 24px;
}
.eyebrow {
  font-size: 11px;
  letter-spacing: 0.15em;
  color: #655781;
  margin-bottom: 10px;
}
h1 {
  font-size: 26px;
  line-height: 36px;
  font-weight: 600;
  margin: 0 0 8px;
}
header > p:last-child {
  font-size: 12px;
  line-height: 18px;
}
.panel {
  background: white;
  border: 1px solid #ded9e5;
  border-radius: 16px;
  overflow: hidden;
}
.content {
  padding: 24px;
  display: grid;
  gap: 24px;
}
h2 {
  font-size: var(--md-sys-typescale-title-small-size);
  line-height: var(--md-sys-typescale-title-small-line-height);
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.supporting {
  font-size: var(--md-sys-typescale-body-small-size);
  line-height: var(--md-sys-typescale-body-small-line-height);
}
footer {
  padding: 14px 24px;
  border-top: 1px solid #ebe7ef;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
</style>
