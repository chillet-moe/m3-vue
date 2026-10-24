# Component Categories

The component sidebar groups components by their primary purpose in the interface, rather than by implementation, DOM structure, or visual form.

## Classification principles

- Classify each component by its main responsibility in the user interface.
- When a component could fit more than one category, place it where users are most likely to look for it.
- Use component families as subcategories where helpful. For example, `ProgressIndicator` groups circular and linear progress indicators.
- Categories organize documentation navigation; they do not define package exports, API stability, or source directory boundaries.

## Current categories

| Category         | Purpose                                                 | Components                                                                                   |
| ---------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Infrastructure` | Provide shared infrastructure for component overlays    | `OverlayHost`                                                                                |
| `Actions`        | Trigger commands or operations                          | `Button`, `IconButton`, `ButtonGroup`, `FloatingActionButton`, `FloatingActionButtonMenu`    |
| `Feedback`       | Communicate status, guidance, feedback, or progress     | `Badge`, `Skeleton`, `Snackbar`, `Tooltip`, `ProgressIndicator`                              |
| `Containment`    | Hold, divide, organize, or overlay content              | `Accordion`, `BottomSheet`, `Card`, `Dialog`, `Divider`, `ListItem`, `Popover`, `SideSheet`  |
| `Display`        | Present basic visual content                            | `Icon`                                                                                       |
| `Inputs`         | Accept text, structured values, or queries over options | `Combobox`, `DatePicker`, `DateRangePicker`, `InputOtp`, `Select`, `TextField`, `TimePicker` |
| `Navigation`     | Move between pages, views, or content sections          | `Breadcrumb`, `Menu`, `NavigationDrawer`, `NavigationRail`, `Pagination`, `Tabs`             |
| `Selection`      | Choose, toggle, or adjust an existing value             | `CheckBox`, `Chip`, `ChipGroup`, `Radio`, `Slider`, `Switch`                                 |

## Progress indicators

`ProgressIndicator` is nested under `Feedback`, with `CircularProgressIndicator`, `LinearProgressIndicator`, and `LoadingIndicator` beneath it. These components tell users that a task is in progress, show its progress, or indicate that it is not yet complete. They do not accept user input, navigate, or contain other content.
