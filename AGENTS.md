- 添加新组件时参照 engineering/add-component.instructions.md 中的步骤进行。
- 如果可以，倾向于复用组件库中已有的组件，或者在其基础上进行定制，而不是从头开始开发新组件。
- `Button` 和 `IconButton` 的视觉层级应由操作重要性决定。`filled` 仅可用于当前表面或操作组中唯一的主要、最终操作，但主要、最终操作并不因此必须使用 `filled`；层级未知时，`Button` 使用默认的 `text` 或显式 `outlined`，`IconButton` 使用默认的 `standard`。工具栏、列表行和卡片中的 `IconButton` 不使用 `filled`。`Dialog` 和 `showDialog` 的所有底部操作均使用 `text`，包括主要、确认、最终和破坏性操作；不要使用 `filled`、`tonal` 或 `outlined` 强调 Dialog 的主要操作，操作层级通过文案、排列顺序和位置表达。
- 效果倾向于使用纯 css 实现。
- 我是这个库的唯一使用者，所以适度的 API 变更修改是可以接受的。
- 非简单的组件、Composable、provide/inject、公开 API 或状态职责边界变更必须使用 `$vue-architecture-boundaries` skill。项目是 Vue 组件库，不要套用应用项目的 Pinia/路由规范，也不要把 Composable 视为高于组件的抽象层级。
- scoped style、模板样式 class、组件布局或跨组件样式边界修改必须同时使用 `$vue-scoped-css` skill。
- 是否添加测试按风险决定：新增组件、复杂交互、可访问性行为、状态机、事件/键盘处理、表单值同步、bug 修复需要优先补测试；仅修改默认值、文案、文档、简单样式 token 或纯视觉微调时，通常不需要为了覆盖率额外新增测试。
- 项目使用 Vite Plus，包管理器、构建、测试、格式化、lint 等工具都通过 `vp` 命令进行管理。请参阅 [Vite+ 文档](engineering/vite-plus.md) 以获取更多信息。
- 修改 Slider 的动画、value indicator 或性能相关逻辑时，先阅读 [Slider 性能说明](engineering/slider-performance.md)，避免重新引入每帧布局或破坏 popover 层级。
- 通用 Token：

  组件约定使用以下 CSS 变量（Token）：
  - `--md-color-container`: 容器的颜色
  - `--md-color-on-container`: 容器上内容的颜色
  - `--md-state-layer-color`: State layer（水波纹）颜色

  当用户需要对组件进行定制时，优先使用这些通用 Token 来覆盖样式，而不是直接修改组件的 CSS。这是为了在组件嵌套时，这些颜色能够被父级组件所使用。
