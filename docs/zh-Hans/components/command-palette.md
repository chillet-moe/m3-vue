---
title: CommandPalette
---

<script setup lang="ts">
import { ref } from 'vue';
import CommandPaletteDemo from '../../demos/command-palette/CommandPaletteDemo.vue';
import demoSource from '../../demos/command-palette/CommandPaletteDemo.vue?raw';

const props = ref({ label: '编辑器命令', size: undefined, shape: undefined });
</script>

# CommandPalette

使用命令面板查找并执行当前上下文中可用的操作。打开示例并搜索 `save`，或输入 `prefs` 按关键字查找命令。

<DemoContainer :src="demoSource" :viewport="false">
  <CommandPaletteDemo v-bind="props" />
</DemoContainer>

## 提供命令

将 `CommandPaletteCommand` 对象数组传给 `commands`。每个命令都应有唯一且稳定的字符串 `id`，以及用于显示的 `name`。使用 `group` 区分同名命令的类别或路径。可选字段包括 `keywords`（字符串数组）、`icon`（Material Symbol 名称）、`shortcut`（显示用的快捷键文本）和 `disabled`。可用操作发生变化时，请更新此数组。

使用 `v-model:open` 控制面板是否打开。在适用的应用级作用域中注册 F3 或 ⌘K 等打开快捷键。通过 `@select` 处理选中的命令并执行相应操作。面板原生关闭后会触发一次事件，并传入命令对象，因此处理函数可以聚焦某个字段或打开另一个对话框。

## 搜索与导航

每次打开时，搜索框都会获得焦点并保持为空，命令按源数组顺序显示。匹配不区分大小写，输入的字符只需依次出现，无需连续。完全匹配的名称和名称前缀优先排列。查询发生变化时，第一个启用的结果会成为当前项。上下文更新后，如果当前命令仍然可用，面板会按其 ID 保留该命令为当前项。

输入时可使用 ↑ 和 ↓ 在启用的结果间移动。按 Enter 或点击结果即可执行命令。按 Escape 或点击背景可关闭面板，并将焦点还给打开面板的控件。输入法组合输入期间，导航和确认按键仍可用于选择候选词。

结果行继承共享的 `rowSize` 设置。可通过 `size` 为单个面板覆盖此设置。面板继承共享的 `shape` 设置。详情请参阅[样式指南](../guides/styling)。

## 参考

<AnatomyTable scope="command-palette" />

<ApiTable component="CommandPalette" v-model="props" :exclude="['commands', 'open']" />
