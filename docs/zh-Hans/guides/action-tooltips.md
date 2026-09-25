---
title: 操作提示
---

# 操作提示

操作组件可通过 `title` 快速设置文本提示。该标题由库的 tooltip 行为渲染，不会传递给 DOM，因此不会显示原生 HTML 提示。

简单操作标题共用一个非交互式提示层。只有在首次悬停、键盘聚焦或长按操作时，才会延迟创建提示层及其锚点，因此未打开的操作不会分配提示 DOM 或每个触发器的事件监听器。共享提示层会跟随当前操作，并在该操作树卸载时释放。

```vue
<Button title="保存更改">保存</Button>

<IconButton icon="settings" title="设置" />

<FloatingActionButton icon="edit" title="撰写" />
```

以下组件支持此行为：

- `Button`
- `IconButton`
- `FloatingActionButton`

对于仅图标操作，如果未提供 `aria-label` 或 `aria-labelledby`，`title` 也会用作备用可访问名称。

```vue
<IconButton icon="settings" title="设置" />

<!-- 可访问名称相同，但提示文本不同。 -->
<IconButton icon="settings" aria-label="打开设置" title="设置" />
```

需要丰富或可交互内容、引用提示层、自定义位置或不同交互选项时，请使用 `v-tooltip`。自定义的丰富提示层会保留自身的 DOM、焦点和交互生命周期，不使用共享的简单标题运行时。

```vue
<Button v-tooltip="'#save-tip'">保存</Button>

<Tooltip id="save-tip" variant="rich">
  保存当前草稿并继续编辑。
</Tooltip>
```

完整指令 API 请参阅 [v-tooltip](/zh-Hans/directives/tooltip)。
