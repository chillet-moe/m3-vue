- 对于 CSS，需要给颜色加上透明度时，可以使用 --translucent 函数（项目中有 postcss 插件提供 polyfill）：

  ```css
  .element {
    color: --translucent(#ff0000, 0.5);
  }
  /* 它会被转化为 color: rgba(from #ff0000 r g b / 0.5)) */
  /* CSS 变量也是可以的 */
  ```
- 添加新组件时的注意事项：
  - 参照已有组件。
  - 使用 reference-tokens 里的 token css，参考已有组件的整理方式。
  - 如果使用 CSS 修改原生 HTML 元素不可行，则可以采用不可见的原生 HTML 元素负责功能和可访问性，自己的元素作为视觉效果的思路。