- 对于 CSS，需要给颜色加上透明度时，可以使用 --translucent 函数（项目中有 postcss 插件提供 polyfill）：

  ```css
  .element {
    color: --translucent(#ff0000, 0.5);
  }
  /* 它会被转化为 color: rgba(from #ff0000 r g b / 0.5)) */
  /* CSS 变量也是可以的 */
  ```
- 如果你看到使用 dp 为单位的样式，dp 是 Android 上的单位，需要转换为 rem。我们规定 1rem = 16，可以使用 --dp 函数（项目中有 postcss 插件提供 polyfill）：

  ```css
  .element {
    width: --dp(16);
  }
  /* 它会被转化为 width: 1rem; */
  ```
- 添加新组件时的注意事项：
  - 参照已有组件。
  - 使用 reference-tokens 里的 token css，参考已有组件的整理方式。
  - 如果使用 CSS 修改原生 HTML 元素不可行，则可以采用不可见的原生 HTML 元素负责功能和可访问性，自己的元素作为视觉效果的思路。
- 优先使用新的平台特性，可以使用 Baseline 2025。如果有兼容性问题，请先询问我。
- 对于组件的 story，除非是例如 Button/IconButton Button/ButtonGroup 这样的情况，不然不要设定 story 的 title，否则会多一层。
- 作出修改后，运行 prepublishOnly 任务，确保没有错误。
- 涉及 CSS 的用法，可以到 https://web.dev/learn/css/ 和 [MDN](https://developer.mozilla.org/) 搜索相关页面，保证使用的是推荐的用法。
- 对于各种效果，尽可能用 CSS 实现，避免 JS。
- 偏好使用逻辑属性与逻辑值（https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Logical_properties_and_values）