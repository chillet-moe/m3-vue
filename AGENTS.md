- 对于 CSS，需要给颜色加上透明度时，可以使用 --translucent 函数（项目中有 postcss 插件提供 polyfill）：

  ```css
  .element {
    color: --translucent(#ff0000, 0.5);
  }
  /* 它会被转化为 color: rgba(from #ff0000 r g b / 0.5)) */
  /* CSS 变量也是可以的 */
  ```
