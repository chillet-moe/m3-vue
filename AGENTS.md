- 添加新组件时参照 engineering/add-component.instructions.md 中的步骤进行。
- 如果可以，倾向于复用组件库中已有的组件，或者在其基础上进行定制，而不是从头开始开发新组件。
- 效果倾向于使用纯 css 实现。
- 我是这个库的唯一使用者，所以适度的 API 变更修改是可以接受的。
- 是否添加测试按风险决定：新增组件、复杂交互、可访问性行为、状态机、事件/键盘处理、表单值同步、bug 修复需要优先补测试；仅修改默认值、文案、文档、简单样式 token 或纯视觉微调时，通常不需要为了覆盖率额外新增测试。
- 项目使用 Vite Plus，包管理器、构建、测试、格式化、lint 等工具都通过 `vp` 命令进行管理。请参阅 [Vite+ 文档](engineering/vite-plus.md) 以获取更多信息。
- 通用 Token：

  组件约定使用以下 CSS 变量（Token）：
  - `--md-color-container`: 容器的颜色
  - `--md-color-on-container`: 容器上内容的颜色
  - `--md-state-layer-color`: State layer（水波纹）颜色

  当用户需要对组件进行定制时，优先使用这些通用 Token 来覆盖样式，而不是直接修改组件的 CSS。这是为了在组件嵌套时，这些颜色能够被父级组件所使用。
