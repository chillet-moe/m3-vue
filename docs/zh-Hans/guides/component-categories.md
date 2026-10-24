# 组件分类

组件侧边栏按组件的主要使用目的分类，而不是按实现方式、DOM 结构或视觉形态分类。

## 分类原则

- 优先看组件在用户界面中承担的主要职责。
- 如果一个组件同时符合多个分类，放到用户最可能寻找它的分类下。
- 组件家族可以作为子分类出现。例如 `ProgressIndicator` 下面包含圆形和线形两种进度指示器。
- 分类只是文档导航结构，不代表包导出、API 稳定性或代码目录边界。

## 当前分类

此表与文档侧边栏中的组件分类对应。`ProgressIndicator` 是一组组件，子项列在名称后。

| 分类             | 标准                         | 组件                                                                                                                                          |
| ---------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `Infrastructure` | 为组件提供共享基础设施       | `OverlayHost`                                                                                                                                 |
| `Actions`        | 触发命令或操作               | `Button`, `IconButton`, `ButtonGroup`, `FloatingActionButton`, `FloatingActionButtonMenu`                                                     |
| `Feedback`       | 传达状态、提示、反馈或进度   | `Badge`, `Skeleton`, `Snackbar`, `Tooltip`, `ProgressIndicator`（`CircularProgressIndicator`, `LinearProgressIndicator`, `LoadingIndicator`） |
| `Containment`    | 承载、分隔、组织或覆盖内容   | `Accordion`, `BottomSheet`, `Card`, `Dialog`, `Divider`, `ListItem`, `Popover`, `SideSheet`                                                   |
| `Display`        | 展示基础视觉内容             | `Icon`                                                                                                                                        |
| `Inputs`         | 输入文本、结构化值或选项查询 | `Combobox`, `DatePicker`, `DateRangePicker`, `InputOtp`, `Select`, `TextField`, `TimePicker`                                                  |
| `Navigation`     | 在页面、视图或内容范围间移动 | `Breadcrumb`, `Menu`, `NavigationDrawer`, `NavigationRail`, `Pagination`, `Tabs`                                                              |
| `Selection`      | 选择、切换或调整一个已有值   | `CheckBox`, `Chip`, `ChipGroup`, `Radio`, `Slider`, `Switch`                                                                                  |

## ProgressIndicator

`ProgressIndicator` 属于 `Feedback`，因为它的核心职责是告诉用户任务正在进行、当前进度是多少，或当前状态尚未完成。它不接收用户输入，也不负责导航或承载内容。
