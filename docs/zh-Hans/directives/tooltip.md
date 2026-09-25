---
title: v-tooltip
---

<script setup lang="ts">
import { Button } from '@/components/Button';
import { Tooltip } from '@/components/Tooltip';
import TooltipDynamicContent from '../../demos/tooltip/TooltipDynamicContent.vue';
import TooltipDynamicContentSrc from '../../demos/tooltip/TooltipDynamicContent.vue?raw';

</script>

# v-tooltip

`v-tooltip` 会将悬停、聚焦、键盘和触摸交互连接到提示表面。若要让现有触发器由指令管理行为，而无需手动维护打开和关闭状态，可使用此指令。

<DemoContainer :viewport="false">
  <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; padding-block: 2rem;">
    <Button v-tooltip="'#tooltip-directive'">生成提示</Button>
    <Button v-tooltip="'#tooltip-directive-rich'">引用提示</Button>
    <Tooltip id="tooltip-directive">
      内容
    </Tooltip>
    <Tooltip id="tooltip-directive-rich" variant="rich">
      内容
    </Tooltip>
  </div>
</DemoContainer>

## 生成提示

传入包含 `content` 的配置对象，指令会替你创建和清理 Tooltip 表面。

```vue
<button
  v-tooltip="{
    content: '帮助文本',
    variant: 'plain',
    placement: 'top',
    interactive: false,
  }"
>
  悬停于此
</button>
```

纯文本提示适合使用此形式。生成的提示与 `Tooltip` 组件使用相同的 DOM 约定和 CSS。裸字符串绑定会被视为目标选择器，而不是行内内容。

## 复用已有 Tooltip

如果提示表面已经渲染，例如使用 `Tooltip` 组件编写丰富提示时，请传入选择器或元素引用。

```vue
<button v-tooltip="'#save-tooltip'">保存</button>

<Tooltip id="save-tooltip" variant="rich" popover="hint">
  保存当前草稿并继续编辑。
</Tooltip>
```

## 绑定 API

`v-tooltip` 接受：

- `string`：已有提示元素的选择器
- `HTMLElement`：已有提示元素
- `TooltipConfig`：配置对象

<SourceApiTable api="vTooltip" type="TooltipConfig" :show-signature="false" />

## 行为说明

- 悬停和聚焦会打开提示。`Escape` 会将其关闭。
- 触摸使用长按交互，并抑制后续合成点击事件。
- 页面滚动或调整大小时，指令会重新定位提示。
- 浏览器不支持 CSS 锚点定位时，会回退到 JavaScript 定位。
- 更新绑定时，只要可能就会更新同一个 Tooltip 实例。

## 动态内容

此指令会让内部打开状态与原生 popover 状态保持同步，因此鼠标点击改变触发器内容和提示文本后，提示仍可正常使用。

如果操作组件已经通过 `title` 提供提示，请将其视为组件的默认提示。对于动态或自定义提示内容，请将 `v-tooltip` 绑定到组件并另行渲染 `Tooltip` 表面，不要与 `title` 混用。

<DemoContainer :src="TooltipDynamicContentSrc" :viewport="false">
  <TooltipDynamicContent />
</DemoContainer>

关于提示表面样式和自定义丰富内容，请参阅 [Tooltip](/zh-Hans/components/tooltip)。
