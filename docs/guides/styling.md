# Styling

M3 Vue 的每个组件都暴露了 `data-scope` 和 `data-part` 属性，作为稳定的 CSS API。你可以使用这些属性来自定义组件样式，而无需使用 Vue 的 `:deep()`。

## data-scope 和 data-part

- **`data-scope`**：标识组件的类型，例如 `button`、`text-field`、`menu-item`。
- **`data-part`**：标识组件内部的具体元素，例如 `root`、`label`、`leading`。

每个组件的根元素都有 `data-part="root"`。

## 用法

使用属性选择器来定位组件的特定部分：

```css
/* 自定义所有 Button 的根元素 */
[data-scope='button'][data-part='root'] {
  border-radius: 8px;
}

/* 自定义 TextField 的 label */
[data-scope='text-field'][data-part='label'] {
  font-weight: bold;
}

/* 自定义 Menu 中 MenuItem 的 label */
[data-scope='menu-item'][data-part='label'] {
  color: red;
}
```

## 与 `:deep()` 的对比

|        | `data-scope` / `data-part` | `:deep()`                    |
| ------ | -------------------------- | ---------------------------- |
| 稳定性 | 稳定的公共 API             | 依赖内部 class 名            |
| 作用域 | 全局或局部均可             | 需在 `<style scoped>` 中使用 |
| 可读性 | 语义化，描述组件结构       | 依赖实现细节                 |

## 查看组件的 Anatomy

每个组件文档页面都包含 **Anatomy** 部分，展示该组件的所有 `data-scope` 和 `data-part`，并支持交互式高亮。
