# 定制

从完整预设开始，再覆盖应用所需的偏好。使用[预设预览](./presets)比较实际布局和组件图库。文档工具栏会编辑相同设置；其 **Code** 页签可导出预设导入、插件覆盖项和 CSS 修改。

## 选择预设

```ts
import { M3VuePlugin } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import { compact } from '@chillet/m3-vue/presets/compact';

app.use(M3VuePlugin, { preset: compact });
```

预设入口会导入主题样式表并提供组件默认值。每个应用样式表只导入一个预设。标准 Material 外观请使用 `@chillet/m3-vue/presets/default` 中的 `defaultPreset`。

| 设置             | default  | compact     |
| ---------------- | -------- | ----------- |
| 排版             | Material | Compact     |
| 密度             | 0        | -2          |
| Switch           | medium   | small       |
| 字段             | medium   | small       |
| 字段标签         | floating | external    |
| Button           | small    | small       |
| IconButton       | small    | extra-small |
| 菜单、树和导航行 | medium   | small       |
| ListItem         | medium   | small       |

compact 使用 small 字段和 body-medium 排版，与常见工具栏布局中的 small 按钮相匹配。未修改的 compact 预设在根字号为 16px 时，两者的高度均为 30px。字段内容上下至少保留 4px 内边距，因此在更低的密度下，字段高度可能仍高于按钮。对话框和面板会继承密度，并缩小内边距和分区间距。进度指示器会根据正文排版和密度缩放几何尺寸；显式设置的尺寸和粗细仍彼此独立。

compact 保留 Slider 和 FAB 现有的默认值，不会改变形状、颜色或交互行为。排版仍决定与文本关联的几何尺寸，密度则调整间距。

compact 将可见字段标签交由父级布局负责。`label` 属性仍可作为无障碍名称的回退值；在 external 模式下，它不会显示为标签或占位符。请参阅[字段布局](./field-layout#标签行为)，了解标签置于上方、字段旁边以及无可见标签的示例。

独立的 `themes/default.css` 和 `themes/compact.css` 文件仍可用于纯 CSS 主题选择，但不会设置 Vue 组件尺寸。预设入口已导入其样式表，因此不要同时再导入另一个主题。Nuxt 的 `m3Vue: { theme: 'compact' }` 会通过生成的插件安装紧凑默认值；`theme: false` 会停用此选择。设置 `directives: false` 会停用指令注册，同时保留所选预设。

## 覆盖组件默认值

```ts
app.use(M3VuePlugin, {
  preset: compact,
  switchSize: 'medium',
  buttonDefaults: { pressShapeMorph: false },
});
```

这会保留 compact 的按钮尺寸，同时改变按压行为。嵌套默认值按属性合并；`undefined` 表示继承，显式的 `false` 会覆盖继承值。优先级为**组件属性 → 子树默认值 → 应用覆盖项 → 预设 → 组件默认值**。响应式 ref 会继续保持响应性。

定制面板在切换预设时会保留显式组件覆盖项。继承设置会显示预设值；移除覆盖项即可重新跟随所选预设。仅选择排版不会改变组件默认值。重置会恢复默认预设。

| 选项                                       | 适用范围                                                                |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `shape`                                    | 共享组件形状                                                            |
| `rowSize`                                  | 菜单行（包括 Select/Combobox 菜单）、TreeView 和导航抽屉/导航栏条目     |
| `fieldSize`                                | 单行 TextField、Select 和 Combobox                                      |
| `fieldLabelBehavior`                       | TextField、Select 和 Combobox 的标签呈现方式（`floating` / `external`） |
| `buttonDefaults`                           | Button 尺寸和按压形变；ButtonGroup 继承按压形变设置                     |
| `switchSize`                               | Switch（`small` / `medium`）                                            |
| `iconButtonSize`                           | IconButton                                                              |
| `sliderDefaults`                           | Slider 尺寸、外观、滚轮输入和数值指示器                                 |
| `listItemDefaults`                         | ListItem 尺寸和外观                                                     |
| `selectDefaults`                           | Select 和 Combobox 的选中标记（`showSelectedIcon`）                     |
| `appearance`                               | Slider 和 ListItem 的共享外观                                           |
| `menuColor`                                | Menu、Select 和 Combobox 菜单                                           |
| `datePickerDefaults`、`timePickerDefaults` | 日期与时间选择器偏好                                                    |
| `snackbarDefaults`                         | 程序化 [Snackbar](../components/snackbar) 偏好                          |

对于一个子树，可使用现有 defaults helper。未指定的字段会继承，值也可使用 ref 或 computed：

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { provideButtonDefaults, provideSliderDefaults } from '@chillet/m3-vue';

const compact = ref(true);
provideButtonDefaults({ size: computed(() => (compact.value ? 'small' : undefined)) });
provideSliderDefaults({ wheel: false });
</script>
```

直接调用 `provide(contextKey, value)` 会替换整个上下文对象。若要保留未指定字段，请使用 defaults helper。

### 行尺寸 {#row-sizes}

Menu、TreeView、NavigationDrawer 和 NavigationRail 共用一套 `size` 尺寸：

| 尺寸             | 单行基准高度 |
| ---------------- | ------------ |
| `extra-small`    | 32px         |
| `small`          | 40px         |
| `medium`（默认） | 48px         |
| `large`          | 56px         |
| `extra-large`    | 64px         |

以上是在密度为 `0`、根字号为 16px 时的参考高度。仅更改行尺寸不会改变文字或图标尺寸；排版和密度仍会影响各自对应的尺寸。多行内容和附加控件可能使行高增加。折叠状态的 NavigationRail 也会为堆叠显示的图标和标签预留空间。

可在插件中设置 `rowSize` 作为应用默认值，也可在某个区域的现有祖先中使用 `provideRowSize`：

```ts
import { provideRowSize } from '@chillet/m3-vue';

provideRowSize('extra-small');
```

该 helper 也接受 ref 或 getter。容器的 `size` 会覆盖继承值；`MenuItem`、`TreeItem`、`NavigationDrawerItem`、`NavigationDrawerSection` 或 `NavigationRailItem` 可以单独覆盖自身尺寸。子菜单继承其菜单的尺寸；`MenuSubMenu.size` 可为其触发项和内容设置不同尺寸。省略 `size` 或将其设为 `undefined` 时会继承。

请先选择行尺寸，再使用 `--md-density` 微调垂直留白。自定义面板的 **Components → Row size** 控件与 **Code** 预览使用相同的应用选项。

### 选择外观与密度

`size` 选择组件几何尺寸，也可能决定排版和图标尺寸。`appearance` 选择 Slider 和 ListItem 的 standard 或 expressive 外观。组件专用外观默认值优先于共享外观设置，包括更近子树中的共享设置。

值选择使用 Select/Combobox，命令使用 Menu，一般内容或导航使用 ListItem。按钮强调层级根据操作重要性选择：常规操作使用 text/outlined Button 或 standard IconButton；Dialog 操作使用 text Button。

## 密度

可在应用或特定区域设置密度：

```css
.property-panel {
  --md-density: -2;
}
.property-panel__comfortable-section {
  --md-density: 0;
}
```

每个负向等级最多减少 4dp 垂直留白，正向等级则增加留白。文字尺寸不变。组件会在内容与最小内边距需要剩余空间时停止收缩，因此没有通用的最小高度或数值范围限制。显式尺寸 token 优先级更高。

密度会调整各组件当前所选的尺寸，不会让所有组件达到统一的目标高度。请先选择组件尺寸：菜单行和超小号按钮可能会在不同的密度值下达到各自的内容下限。

排版、组件尺寸和密度可独立于预设进行覆盖。与文本关联的图标以及复选框、单选按钮和开关的几何尺寸会根据其排版角色确定默认比例，因此自定义字号无需针对预设编写 CSS 覆盖。密度随后调整几何尺寸和留白。独立 IconButton 和 FAB 的尺寸仍由尺寸选项决定；显式组件尺寸会覆盖自动计算值。

密度适用于 Button、ButtonGroup、IconButton、Chip、复选框、单选按钮和开关、字段、InputOtp、ListItem、TreeView、Tabs、菜单行（包括 Select/Combobox 菜单）、Breadcrumb、Pagination，以及 NavigationDrawer/NavigationRail 条目。密度主要调整垂直留白。TextField、Select 和 Combobox 也会按每级调整 2px 水平内边距，最低为 4px，使字段图标与周围留白协调。显式设置的内边距 token 优先。OTP 单元格宽度、导航宽度和字体保持不变。默认操作图标和行图标会随每级密度调整 1px，并限制在一定尺寸范围内。折叠状态的 NavigationRail 条目会保留图标交互目标和堆叠标签所需的空间，因此会更早达到密度下限。多行内容可能增高。Dialog 和 Snackbar 会将继承的密度重置为 0。日期和时间选择器会继承密度：日历单元格和列表、时间输入及操作会随密度调整，而时间选择器钟面的几何尺寸保持不变。密度不会调整页面间距，也不会随断点自动变化。为触屏选择紧凑布局时，请保留足够大的交互目标。

## 排版

主题预设提供完整的排版比例。调整某个角色时，应同时设置字号和行高：

```css
:root {
  --md-ref-typeface-plain: 'Inter';
  --md-ref-typeface-brand: 'Inter';
  --md-sys-typescale-body-large-size: 0.875rem;
  --md-sys-typescale-body-large-line-height: 1.25rem;
}
```

请在应用中加载字体。各角色也提供 `font`、`weight` 和 `tracking`；强调角色使用 `--md-sys-typescale-emphasized-*` 前缀。密度与排版互相独立，但内容感知控件会为较大的文字增高。可用 `m3-typo-*` 类为自定义内容应用排版角色。

## 颜色

优先使用主题颜色角色，避免在组件内部写死颜色。例如，分别设置浅色和深色方案中的主色及其前景色：

```css
:root {
  --md-sys-color-primary-light: #365e9d;
  --md-sys-color-on-primary-light: #ffffff;
  --md-sys-color-primary-dark: #aac7ff;
  --md-sys-color-on-primary-dark: #003062;
}
```

容器色和前景色是成对的角色。组件通过 `color-scheme` 解析浅色/深色角色。嵌套的自定义内容可使用 `--md-color-container`、`--md-color-on-container` 和 `--md-state-layer-color`，继承当前容器色、前景色和状态层颜色。

## 组件形状模式 {#component-shape-modes}

在插件或组件上设置 `shape`，选择一种圆角处理方式：

| 形状      | 行为                                                               |
| --------- | ------------------------------------------------------------------ |
| `rounded` | 保留现有的 Material 圆角处理方式；各类表面仍使用其对应的圆角半径。 |
| `square`  | 在支持的地方采用现有的 Material 方角处理方式；这不代表半径为零。   |
| `minimal` | 按角色采用细微圆角：2px、3px、4px 或 6px。                         |
| `sharp`   | 圆角为 0px，包括选中和按压状态。                                   |

`minimal` 使用以下角色半径：

| 半径 | 组件                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| 2px  | CheckBox、菜单/树/列表行、导航条目、日历日期格和 Snackbar                      |
| 3px  | Button、IconButton、ButtonGroup、字段（包括 OTP）、Chip 和 FAB 菜单项          |
| 4px  | Card、Menu、Popover、FAB、FAB 菜单触发器和导航容器                             |
| 6px  | Dialog、BottomSheet、SideSheet、DatePicker、DateRangePicker 和 TimePicker 表面 |

按压形变仍可单独配置。启用时，支持该行为的 `minimal` 控件在按压时使用 2px 圆角；禁用时则保留其角色半径。选中状态的控件也保留其角色半径。若要使用 minimal 圆角但禁用按钮按压形变，可在插件中设置 `{ shape: 'minimal', buttonDefaults: { pressShapeMorph: false } }`。

以上数值以根字号 16px 为前提。形状不会改变尺寸、密度或排版。

```ts
import { M3VuePlugin, provideShape } from '@chillet/m3-vue';

app.use(M3VuePlugin, { shape: 'minimal' });

// 在现有祖先组件的 setup 中，为一个区域设置覆盖值：
provideShape('sharp');
```

`provideShape` 接受普通值、ref 或 getter。组件未指定 `shape` 时会继承最近的共享默认值；组件专属的上下文偏好和显式属性优先级更高。`Menu`、`MenuSubMenu`、`TreeView`、`NavigationRail`、`Select` 和 `Combobox` 会将自己的形状传给其拥有的后代。`ButtonGroup` 和 `NavigationDrawer` 会通过组件上下文设置其成员的默认值。Card 或 Dialog 的局部形状只会改变其表面；若要改变整个区域，请使用 `provideShape`。

支持形状设置的组件包括 Button、IconButton、ButtonGroup、ListItem、TextField、Select、Combobox、InputOtp、CheckBox、Chip、Card、FloatingActionButton 及其菜单、Menu/MenuItem、TreeView/TreeItem、导航抽屉/导航栏条目、Popover、Dialog、Snackbar、BottomSheet、SideSheet、DatePicker、DateRangePicker 和 TimePicker。Radio 圆形、switch 拨钮、进度指示器、钟面和头像会保留其语义形状。

`rounded` 和 `square` 保留现有的按压与选中行为。`minimal` 不会形变为药丸形；`sharp` 在状态层、颜色及其他交互反馈正常工作的同时保持方角。`Button.pressShapeMorph` 和 `ButtonGroup.pressShapeMorph` 仍可用于禁用按压形变。

显式设置组件圆角 token 会覆盖形状模式；提供这些 token 即表示由你负责该组件的几何形状。下方的语义角色 token 可用于定制 Material 形状模式。

## 主题级形状 token

语义圆角 token 可协调整个组件库的圆角：

```css
:root {
  --md-shape-action: 1.25rem;
  --md-shape-field: 0.75rem;
  --md-shape-field-square: 0.5rem;
  --md-shape-chip: 0.5rem;
  --md-shape-card: 0.75rem;
  --md-shape-popover: 0.75rem;
  --md-shape-overlay: 1.5rem;
}
```

`--md-shape-action` 应使用有限圆角；完全圆角可能导致圆角形变不稳定。方角、按压和选中形状会从该值派生。仅当这些形状需要独立设置时，才配置 `--md-shape-action-square`、`--md-shape-action-pressed` 或 `--md-shape-action-selected`。`--md-shape-compact`、`--md-shape-indicator` 和 `--md-shape-fab` 分别控制紧凑元素、指示器和 FAB。

## 组件样式

每个组件页面的 **Styling** 部分会列出公开 token。可用它们处理局部差异：

```vue
<TextField class="search-field" label="Search" />

<style scoped>
.search-field {
  --md-outlined-text-field-container-shape: 0.5rem;
  inline-size: 100%;
}
</style>
```

共享修改应使用库的语义 token：`--md-control-outline-*` 可协调控件静止状态的边框，[交互光标 token](./interaction-cursors) 可统一光标，[浮动表面 token](../utilities/elevation#floating-surfaces) 可协调浮层。以 `--_` 开头的变量属于内部实现细节。

### data-scope 与 data-part

当属性和 token 不够用时，使用组件文档中的 **Anatomy**。`data-scope` 标识组件，`data-part` 标识稳定部件。在 scoped CSS 中，深层选择器应以自己的 class 为锚点：

```css
.search-field :deep([data-part='label']) {
  font-weight: 600;
}
```

根布局使用普通 class。避免依赖私有 `.m3-*` class 或组件根 HTML 标签。选择器行为详见 [Vue Scope Boundaries](./vue-scope-isolation)。

## 字段间距

字段之间的间距由父级布局负责。可在该布局中使用共享间距 token：

```css
.form-fields {
  display: grid;
  row-gap: var(--md-field-row-gap);
  column-gap: var(--md-field-column-gap);
}
```

这两个 token 的默认值均为 `1rem`，可在全局或单个区域覆盖。密度不会改变它们。自定义面板的 **Theme** 页签可调整这些 token；**Code** 页签会提供 `.form-fields` 示例。将该 class 用于父级布局，并根据表单内容选择列数。`labelClearance` 会在浮动标签上方增加空间，并叠加在父级间距之上。响应式网格示例和交互式间距预览见[字段布局](./field-layout)。

## 在文档中试用设置

点击工具栏中的 **Customize**，试用主题、排版、形状和组件设置。所选预设会反映当前值；自定义修改后，某个分组可能不再选中任何预设。更改仅保存在当前浏览器中，并作用于文档站点。**Code** 页签会显示在应用中应用当前设置所需的主题导入、插件选项和 CSS。可分别复制各文件；CSS 仅包含对已导入主题的覆盖。**Reset all** 会重置面板设置；深色模式和固定预览仍是独立的工具栏偏好。

有关图标缩放和来源校准，请参阅[图标尺寸](./icon-sizing)。
