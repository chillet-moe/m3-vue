# Component Categories

组件侧边栏按组件的主要使用目的分类，而不是按实现方式、DOM 结构或视觉形态分类。

## 分类原则

- 优先看组件在用户界面中承担的主要职责。
- 如果一个组件同时符合多个分类，放到用户最可能寻找它的分类下。
- 组件家族可以作为子分类出现。例如 `ProgressIndicator` 下面包含圆形和线形两种进度指示器。
- 分类只是文档导航结构，不代表包导出、API 稳定性或代码目录边界。

## 当前分类

| 分类          | 标准                         | 组件                                                                           |
| ------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `Actions`     | 触发命令或操作               | `Button`, `IconButton`, `ButtonGroup`                                          |
| `Feedback`    | 传达状态、提示、反馈或进度   | `Badge`, `Snackbar`, `Tooltip`, `ProgressIndicator`                            |
| `Containment` | 承载、分隔、组织或覆盖内容   | `BottomSheet`, `Card`, `Dialog`, `Divider`, `ListItem`, `Popover`, `SideSheet` |
| `Display`     | 展示基础视觉内容             | `Icon`                                                                         |
| `Inputs`      | 输入文本、结构化值或选项查询 | `Combobox`, `InputOtp`, `Select`, `TextField`                                  |
| `Navigation`  | 在页面、视图或内容范围间移动 | `Menu`, `NavigationRail`, `Pagination`, `Tabs`                                 |
| `Selection`   | 选择、切换或调整一个已有值   | `CheckBox`, `Chip`, `ChipGroup`, `Radio`, `Slider`, `Switch`                   |

## ProgressIndicator

`ProgressIndicator` 属于 `Feedback`，因为它的核心职责是告诉用户任务正在进行、当前进度是多少，或当前状态尚未完成。它不接收用户输入，也不负责导航或承载内容。
