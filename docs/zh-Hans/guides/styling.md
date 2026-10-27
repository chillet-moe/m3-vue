# 样式

## 选择外观与密度

先根据组件的语义角色选择组件，再独立决定其视觉外观和尺寸。

| 需求                         | 组件 / 选择                                                                |
| ---------------------------- | -------------------------------------------------------------------------- |
| 选择一个值                   | Select 或 Combobox。                                                       |
| 执行命令或打开子菜单         | Menu 与 MenuItem。                                                         |
| 展示一般列表内容或导航       | ListItem；选择按钮、链接或非交互展示语义。                                 |
| 密集的属性面板和频繁浏览的行 | Standard Slider 和 ListItem，搭配紧凑字段尺寸。                            |
| 突出的控件或丰富的导航表面   | 当较大的几何尺寸和动效适合当前表面时，使用 Expressive Slider 或 ListItem。 |

Slider 和 ListItem 默认使用 `appearance="standard"`。Expressive 保留原有外观。这不是全库通用的变体；应使用各组件文档中的 API，而不是给所有控件传入 `appearance`。ListItem 的 standard 外观会让活动指示器保持整行宽度，不展开高亮，也不执行按压形状变换。

使用 `size` 选择组件支持的尺寸，并通过公开 Token 做更细致的调整。视觉尺寸较小不代表命中区域也要变小：Slider 将滑块和轨道尺寸与目标区域尺寸分开控制。Slider 可搭配 TextField 实现精确输入，详见 [Slider](../components/slider#精确数字输入)。TextField、Select 和 Combobox 支持相同的 32px、40px 和 56px 字段高度。为浮动标签预留空间，详见[字段间距](./field-layout)。

根据操作的重要性选择按钮强调层级。`filled` 可用于唯一的主要操作，但不是所有主要操作都必须使用。常规操作使用 text/outlined 按钮或 standard IconButton；Dialog 操作使用 text。确保两种主题下的焦点都清晰可见。优先使用语义 Token 表达颜色；进一步缩小间距前，先检查长标签和窄容器下的显示效果。

组件样式优先通过 CSS 变量定制。

当变量不能表达目标效果时，再覆盖具体的 `data-part`。M3 Vue 组件通过
`data-scope` 和 `data-part` 暴露稳定的 CSS API。全局样式可以直接使用这些
属性选择器；在 SFC 的 `<style scoped>` 中，只有确实需要跨越组件边界访问
内部部件时才使用 `:deep()`。

## 紧凑排版

对于密集的桌面工作区，可在基础样式表之后启用紧凑排版预设：

```ts
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/typography-compact.css';
```

该预设会调整整个应用的系统字体大小和行高，但不会改变根字体大小、组件尺寸、图标尺寸或点击区域。组件几何尺寸应单独选择，例如在 `M3VuePlugin` 中设置 `fieldSize: 'extra-small'` 和 `buttonDefaults: { size: 'extra-small' }`。

| 角色                                       | 以 16px 根字体计算的字号 / 行高 |
| ------------------------------------------ | ------------------------------- |
| `body-large`、`body-medium`、`label-large` | 12px / 18px                     |
| `body-small`、`label-medium`               | 11px / 16px                     |
| `label-small`                              | 10px / 14px                     |
| `title-small`                              | 13px / 20px                     |
| `title-medium`                             | 14px / 20px                     |
| `title-large`、`headline-small`            | 18px / 24px                     |

强调样式使用相同的紧凑字号和行高。字体族、字重和相对字间距保持不变；display 角色以及 medium/large headline 保留默认值。`label-small` 仅用于次要的短注释，不用于主要控件或字段值。

TextField、Select 和 Combobox 在不同尺寸下保持相同的输入文字排版。Button 和 Tabs 会根据尺寸选择排版角色。该预设会连同菜单和列表排版一起更新这些角色，但不会让所有尺寸都使用相同字号。

对于应用自有的文字，可在内容根节点应用排版 class，或根据合适的系统角色设置字号和行高。不要缩小 `html` 的字体大小，否则基于 rem 的组件几何尺寸也会随之缩小。

```css
.workspace {
  font-size: var(--md-sys-typescale-body-medium-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}
```

该预设也会影响使用这些角色的排版工具类和正文内容。仅在应用范围的主题中导入，不要仅为一个面板设置。现有组件 token 仍优先于其系统 fallback。可在未分层的全局样式表中使用自定义系统 token 调整预设，并检查应用所支持语言中的长标签、浮动标签、下拉选项和窄布局。

## CSS token 分层

组件使用五层 CSS token：

1. `--md-sys-*`：全局 Material system token，用于主题级配置。不建议在单个组件实例上局部覆盖。
2. `--md-shape-*`、`--md-control-*` 和 `--md-cursor-*`：库级语义 token，用少量变量把 system token 映射到组件共享的 shape、control outline 与交互 cursor 角色。
3. `--md-color-container`、`--md-color-on-container`、`--md-state-layer-color`、`--md-icon-size`：上下文 token，
   用于父组件向子组件传递容器色、内容色、state layer 颜色和图标尺寸。组件应在自己拥有的最小 icon 容器上设置
   `--md-icon-size`，避免尺寸影响无关的后代 Icon。
4. `--md-<component>-*`：组件 public token，是推荐的组件级定制入口。
5. `--_*`：组件内部 private token，只用于实现细节，不作为外部 API。

组件会用 `:where(:root)` 声明 public token 占位符，值为 `initial`。这只是给编辑器和 CSS API 一个明确声明，不是默认值；实际默认值集中在组件根元素的 private token fallback 上。这样 WebStorm 不需要解析深层 `var()` fallback，也不会因为组件 CSS 加载顺序覆盖用户自己的 `:root` 或局部定制。

组件 public token 只覆盖有明确语义的部件或稳定状态，例如 container、label、selected、unselected、error、disabled。`hover`、`focus`、`pressed` 这类瞬时交互状态优先通过 state layer 表达，不默认展开成完整的颜色 token 矩阵。

新增定制优先使用组件自己的 `--md-<component>-*` token。旧的 `--md-comp-*` token 不作为公开 API。

普通 action 与真实 URL link 使用独立的全局 cursor token。需要把控件切换为桌面应用式默认箭头时，参阅
[Interaction Cursors](/zh-Hans/guides/interaction-cursors)。

每个组件页面的 **Styling** 表格由显式 metadata 生成，只列出推荐的 public token。metadata 按组件拆分在 `docs/.vitepress/zh-Hans/components/style-tokens/<ComponentName>.ts`，统一入口 `style-token-meta.ts` 只负责注册组件名到对应 metadata。

## 主题级 shape token

如果只是想统一整套组件的圆角风格，优先覆盖少量 `--md-shape-*` 语义 token，而不是逐个组件改 `--md-<component>-*` 或 `data-part`。

文档右上角的 Shape 控制器会把这些变量写到文档根节点，因此调整会直接作用到整站组件。

```css
:root {
  --md-shape-action: var(--md-sys-shape-corner-extra-large);
  --md-shape-field: var(--md-sys-shape-corner-large);
  --md-shape-field-square: var(--md-sys-shape-corner-medium);
  --md-shape-chip: var(--md-sys-shape-corner-small);
  --md-shape-card: var(--md-sys-shape-corner-medium);
  --md-shape-popover: var(--md-sys-shape-corner-large);
  --md-shape-compact: var(--md-sys-shape-corner-extra-small);
  --md-shape-overlay: var(--md-sys-shape-corner-extra-large);
  --md-shape-indicator: var(--md-sys-shape-corner-full);
  --md-shape-fab: var(--md-sys-shape-corner-large);
}
```

需要统一 action 的 square、pressed 或 selected 形变时，可以覆盖对应的 action 语义 token：

`--md-shape-action` 建议使用有限圆角值，不要设为 `--md-sys-shape-corner-full`，否则 Button、IconButton 等组件在圆角动画中可能出现抖动。
Square action 默认按比例派生自 `--md-shape-action`，只有需要让 square、pressed 或 selected 形变偏离 action 基准时，才需要覆盖下面这些 token。

```css
:root {
  --md-shape-action-square: var(--md-sys-shape-corner-small);
  --md-shape-action-pressed: var(--md-sys-shape-corner-extra-small);
  --md-shape-action-selected: var(--md-sys-shape-corner-medium);
}
```

当某个组件确实需要偏离全局语义时，再覆盖组件 public token：

```css
:root {
  --md-outlined-text-field-container-shape: var(--md-sys-shape-corner-small);
}
```

同尺寸的 outlined Button 与 TextField 共享静止状态的 control outline token。需要统一调整控件边界时，优先覆盖：

```css
:root {
  --md-control-outline-color: var(--md-sys-color-outline-variant);
  --md-control-outline-width-extra-small: 0.0625rem;
  --md-control-outline-width-small: 0.078125rem;
  --md-control-outline-width-medium: 0.09375rem;
}
```

```css
.custom-checkbox {
  --md-checkbox-color: var(--md-sys-color-tertiary);
  --md-checkbox-on-color: var(--md-sys-color-on-tertiary);
  --md-checkbox-unselected-outline-color: var(--md-sys-color-tertiary);
}

.power-progress {
  --md-progress-indicator-color: v-bind(powerConsumptionColor);
}
```

如果需要定制 disabled 等稳定状态，可以覆盖对应的组件 token：

```css
.custom-checkbox {
  --md-checkbox-disabled-color: var(--md-sys-color-outline);
  --md-checkbox-disabled-opacity: 0.5;
}
```

## data-scope 和 data-part

- **`data-scope`**：标识组件的类型，例如 `button`、`text-field`、`menu-item`。
- **`data-part`**：标识组件内部的具体元素，例如 `root`、`label`、`leading`。

组件根元素使用 `data-part="root"`。给单个组件实例传入 class 是定制根元素
的首选方式；这属于普通 Vue class fallthrough，不是 scope-boundary
提供的授权机制。从父组件访问内部 `data-part` 则是显式的深层定制。

在启用了 `@chillet/vue-scope-boundary` 的 scoped SFC 中，正向 HTML type
selector（如 `button`、`.toolbar > button`、`button.primary`）只匹配本 SFC
写出的原生元素。纯 class、ID 和 attribute selector 仍遵循 Vue 原生规则，
可以命中子组件根元素。因此短 class 名碰撞仍需通过组件前缀、BEM、CSS
Modules 或其他命名约定避免。

## 用法

在全局样式中，可以直接使用属性选择器：

```css
[data-scope='text-field'] [data-part='label'] {
  font-weight: bold;
}
```

在 scoped SFC 中，使用 `:deep()` 明确表示有意跨越组件边界：

```css
/* 自定义 TextField 的 label */
[data-scope='text-field'] :deep([data-part='label']) {
  font-weight: bold;
}

/* 自定义 Menu 中 MenuItem 的 label */
[data-scope='menu-item'] :deep([data-part='label']) {
  color: red;
}
```

如果只需要定制组件根元素，给实例传入语义明确的 class，并使用纯 class
selector：

```vue
<Button class="checkout-action">Checkout</Button>

<style scoped>
.checkout-action {
  inline-size: 100%;
}
</style>
```

不要给这类规则附加组件内部的根标签或 private class。`button.checkout-action`
会被视为对私有根标签的依赖，只匹配本 SFC 自己写出的 `<button>`；
`.m3-button.checkout-action` 则依赖组件内部实现。

## 查看组件的 Anatomy

每个组件文档页面都包含 **Anatomy** 部分，展示该组件的所有 `data-scope` 和 `data-part`，并支持交互式高亮。

## 浮动表面

使用共享的[浮动表面 token](../utilities/elevation.md#floating-surfaces)，统一为菜单、下拉菜单、Popover、丰富 Tooltip 和 Dialog 设置主题，包括使用方自有的原生对话框。只有个别组件需要例外样式时，才使用组件 token。
