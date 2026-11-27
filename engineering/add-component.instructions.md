# 添加新组件

## 1. 对照同类组件，确定公开能力

先看使用者会把新组件放在哪里、会用它完成什么操作，再选取相邻组件的源码、文档和测试作对照。不同能力可以有不同参照。例如数值字段可以复用 Slider 的步进规则，同时沿用单行字段的尺寸和面板配置。

- **值和交互**。确定 prop、`v-model`、事件和 slot 的含义。对可编辑控件，明确何时更新模型、何时保留草稿、取消后恢复什么值。检查键盘、焦点、禁用和无障碍名称在主要使用场景中的行为。
- **家族约定**。核对同类组件的尺寸、外观、密度、形状和交互偏好。判断哪些应由实例指定，哪些应跟随应用或所在子树，哪些由排版、颜色等 CSS token 决定。复合组件优先让内部已有控件负责它已经支持的行为和默认值。
- **实现边界**。优先组合现有组件，或复用已有的计算、响应式逻辑和样式。组件负责自己的 DOM、焦点和局部交互。多部件共享状态时明确由哪个实例创建和修改。涉及非简单组件、公开 API 或状态边界时按仓库约定使用 `$vue-architecture-boundaries`。[仓库约定](../AGENTS.md)

Material 组件的规范、视觉状态和动画可参考 [Material Components for Android](https://github.com/material-components/material-components-android/tree/master/docs/components) 和仓库的 [Material 组件 token](../reference-tokens/components)。

## 2. 接入可覆盖的默认值

对上一步确定为应用或子树偏好的属性，先从[定制指南](../docs/zh-Hans/guides/styling.md)找到对应的插件选项，再沿着同类组件找到公开的 context key 和读取逻辑。库的覆盖顺序从高到低为 **实例 prop → 子树默认值 → 应用显式插件选项 → 所选预设的 defaults → 组件兜底值**。

**复用已有偏好。** 单行字段共享 `fieldSize` 和 `fieldContextKey`，菜单项和导航行共享 `rowSize`。新组件属于这些家族时，直接消费相同的配置，并使用对应的尺寸样式。下表以单行字段为例。

| 使用场景                                              | 尺寸由谁决定                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 未安装插件，或使用没有指定字段尺寸的 default 预设     | `useFieldSize` 返回字段的兜底值。普通单行字段为 `medium`，SliderField 传入自己的兜底值 `extra-small` |
| 安装 compact 预设                                     | 预设提供 `fieldSize: 'small'`，同一面板里的字段随之对齐                                              |
| 安装 compact 并显式指定插件选项 `fieldSize: 'medium'` | 插件把显式值提供给应用中的字段                                                                       |
| 面板提供 `fieldContextKey`，其中 `size` 为 `small`    | 面板内的字段使用最近的配置                                                                           |
| 面板中的某个字段显式传入 `size="extra-small"`         | 该实例使用自己的 prop                                                                                |

组件保留 prop 的“未指定”状态，把兜底值放在读取上下文之后。对允许继承的布尔 prop，区分省略和显式 `false`。上下文接受 ref 时保留响应性。字段尺寸的现成实现见 [useFieldSize](../src/components/TextField/FieldContext.ts)、[SliderField](../src/components/SliderField/SliderField.vue) 和[字段尺寸样式](../src/styles/field-size.css)。

**引入新的可配置偏好。** 当现有选项无法表达实际用途时，需要接通以下入口。

1. 在拥有该偏好的模块定义类型和公开的 `InjectionKey`。应用安装和子树覆盖使用同一个 key。直接 `provide(key, object)` 会替换最近的整个对象。需要让子树只覆盖个别属性时，按字段继承父级偏好。可参照 [SliderContext](../src/components/Slider/SliderContext.ts)。
2. 接入 [M3VuePlugin](../src/plugin.ts) 的选项和相应安装函数。样式和字段配置见[样式默认值](../src/styles/context.ts)，交互配置见[组件默认值](../src/defaults.ts)。新增对象形式的配置组时，更新插件的预设合并逻辑，使应用只覆盖其中一项时仍保留预设中的其他项。
3. 确认 default 和 compact 下的有效值。预设有意改变组件偏好时，在[预设定义](../src/presets/definitions.ts)中声明差异。沿用兜底值时可省略该项。排版、密度和颜色通过主题 CSS 生效，Vue 组件默认值通过插件安装预设生效。字段几何与密度的关系见[尺寸规则](density.md)。
4. 若文档站的定制面板提供这个新选项，核对其控件、预设值读取、子树预览及代码导出。面板已有的共享选项可直接用于新组件。[定制面板的选项映射](../docs/.vitepress/customization/defaults.ts)

## 3. 实现组件和样式

将 SFC、组件样式和组件测试放在 `src/components/<Name>/`。多部件组件的子组件与父组件放在同一目录。SFC 使用 TypeScript 声明公开 props、emits、slots 和 model，为消费者需要了解的语义添加 JSDoc。

优先使用原生控件承载键盘、焦点、选择及表单行为。需要自绘外观时，保留原生控件的可操作性和无障碍语义，参照 [CheckBox](../src/components/CheckBox/CheckBox.vue)。组件生成关联 label、说明或弹层所需的 DOM ID 时，在实例内使用 Vue 的 `useId()`，保证服务端渲染与水合一致。内置的可见文案和无障碍文案沿用现有[本地化入口](../docs/zh-Hans/guides/localization.md)。

独立的响应式职责可以放在 composable 中。需要支持自定义模板时再公开 headless 接口。模板 ref 与 composable 返回对象使用不同的绑定名，避免同名模板 ref 占用逻辑对象的绑定。

编写模板 class、布局或 scoped 样式时使用 `$vue-scoped-css`。

- 在组件模板元素上标记 kebab-case 的 `data-scope` 和表达角色的 `data-part`，包括条件渲染的部件。根部件为 `root`。使用稳定的 `data-size`、`data-variant` 等属性表达适用的状态。
- 组件样式沿用同类组件的独立 CSS 和 `@layer`。优先使用 CSS 逻辑属性、现有排版、尺寸、`--md-shape-*` 和密度规则。父子组件之间传递语义色使用 `--md-color-container`、`--md-color-on-container` 和 `--md-state-layer-color`。按压、悬停等反馈优先使用现有[状态层](../docs/zh-Hans/utilities/state-layer.md)。
- 有稳定定制需求的部件或状态才暴露 `--md-<component>-*`。在 `@layer tokens` 的 `:where(:root)` 中用 `initial` 声明公开 token，在组件私有 `--_*` 变量的 fallback 中给出默认值。可参考 [CheckBox 的 token 定义](../src/components/CheckBox/CheckBox.css)。
- scoped 样式中的正向标签选择器只用于本 SFC 声明的原生元素。纯 class 或属性选择器仍可能命中子组件根。调整子组件根布局时，在调用处传入语义 class。定制内部部件时优先用公开 token，必要时用该实例的 class 限定 `:deep([data-part='…'])` 的范围。

## 4. 导出并接入文档站

| 入口                                                                                       | 需要维护的内容                                                                                                                                       |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 组件目录的 `index.ts` 和[包入口](../src/index.ts)                                          | 导出具名组件、公开类型，以及供使用者调用的 composable、context key 或 provider。可参考 [Slider 的目录入口](../src/components/Slider/index.ts)        |
| [自动导入解析器](../src/resolver.ts)                                                       | 在 `m3VueComponentNames` 中登记公开组件及可独立使用的子组件。Nuxt 按同一列表注册，IDE 的 `web-types.json` 在构建时从包入口生成                       |
| `docs/components/`、`docs/zh-Hans/components/` 和 `docs/demos/`                            | 英文与简体中文页面一一对应，共用 demo SFC。小型子组件随父组件文档说明。翻译遵循仓库 AGENTS.md 的分工                                                 |
| [侧边栏](../docs/.vitepress/config.ts)与[组件分类](../docs/guides/component-categories.md) | 独立页面按主要用途加入对应分组，同步维护两种语言的分类页。中文侧边栏从共享配置生成                                                                   |
| [样式 token 元数据](../docs/.vitepress/components/style-token-meta.ts)                     | 暴露组件专用公开 token 时，在同目录的 `style-tokens/<Name>.ts` 定义名称、作用与 fallback，再注册到元数据表。预览定位不准确时补充公开的 scope 和 part |

组件页先写用途和可操作的示例，再介绍常见组合、键盘和交互约定。支持可覆盖默认值时，说明实例 prop、插件选项、子树配置和预设效果，并更新定制指南中该选项的适用范围。最后在 Reference 中放 `AnatomyTable`、`ApiTable`，以及适用的 `StyleTokenTable`。让 `ApiTable` 编辑的 props 驱动顶部示例。双向绑定的业务值由 demo 自己持有。示例可以通过 `?raw` 向 `DemoContainer` 提供源码。页面顺序和翻译要求见[文档编写规范](documentation.md)。

## 5. 验证使用者能得到的结果

- **交互和可访问性**。从实际入口操作组件，检查模型和事件、键盘和焦点，以及禁用行为。已有同类测试时优先补上会漏掉的行为。涉及布局、指针捕获、原生文本选择或弹层层级时，使用相应的[浏览器 fixture](../tests/browser)或在文档 demo 上验证。
- **默认值和覆盖**。让真实组件消费配置，检查最终尺寸、外观或行为。按接入路径覆盖无配置、compact、应用覆盖、子树覆盖和实例 prop。已有共享字段测试时，将新消费者纳入原来的用例。新增可响应的偏好时，再检查修改 ref 以及撤去显式覆盖后的结果。可参考[字段继承测试](../src/components/TextField/FieldContext.test.ts)和[预设安装测试](../src/presets/presets.test.ts)。
- **发布和文档入口**。运行相关 Vitest 用例、`pnpm run check`、`pnpm run build` 和 `pnpm run docs:build`。打开组件页核对导航、示例、API 控件和样式预览。检查命令和浏览器运行方式见[工具链](toolchain.md)。
