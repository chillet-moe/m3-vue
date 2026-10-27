# Density and theme sizing

Density is a vertical spacing adjustment in 4dp steps. Typography, component size,
icon size and horizontal spacing are independent. A theme preset selects typography
and a density together; it does not change component props.

## Row sizing ownership

`RowSize` and `provideRowSize` own the shared application/subtree/container/item preference. The plugin's `rowSize`
installs that same context. Row geometry is declared once in `src/styles/row-size.css`: 32/40/48/56/64dp for
extra-small through extra-large, with medium as the default. Components consume those metrics and retain their
public geometry token overrides. Typography and icons remain component-owned. Collapsed rail layout adds room for
its stacked contents; it does not redefine the single-line scale.

## Rules

| Family                                                                        | Content and spacing rule                                                                                                                                                                    | Boundary                                                                                                        |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Button / ButtonGroup                                                          | Size selects typography and base height; shared action metrics keep groups aligned. Height follows the larger of text line height and icon size, plus density-adjusted whitespace.          | At least 2dp above and below content.                                                                           |
| IconButton                                                                    | Size selects icon and base height; density adjusts remaining vertical whitespace.                                                                                                           | At least 2dp above and below the icon. Width and icon size stay unchanged.                                      |
| Chip                                                                          | Label line height and icon determine content height.                                                                                                                                        | At least 2dp above and below; avatar/content must still fit.                                                    |
| TextField / Select / Combobox                                                 | Shared field geometry: input line height plus vertical space. Label clearance remains outside the outlined field. Multiline inputs grow with content.                                       | At least 4dp above and below content. Slot actions must fit without shrinking icons.                            |
| ListItem / List                                                               | Size selects minimum height and block padding. Actual grid content determines final height, including descriptions and accessories.                                                         | Block padding stops at 4dp per side; no fixed maximum height.                                                   |
| TreeView                                                                      | Size selects the shared row height; intrinsic body-medium text and disclosure icon retain their size.                                                                                       | At least 4dp above and below content; accessories can grow the row.                                             |
| Tabs                                                                          | Minimum height changes with density; label/icon layout remains intrinsic.                                                                                                                   | At least 4dp vertical breathing room; stacked icon and label must both fit.                                     |
| Menu / Select popup                                                           | Row minimum height and block padding follow density; intrinsic content can grow.                                                                                                            | Inherits density; block padding stops at 4dp per side.                                                          |
| InputOtp                                                                      | Each size keeps its cell width; height follows text line height plus density-adjusted whitespace.                                                                                           | At least 8dp total whitespace; explicit container-size tokens override both axes.                               |
| Breadcrumb                                                                    | Item minimum height follows density; intrinsic text and icons retain their dimensions.                                                                                                      | At least 2dp above and below content.                                                                           |
| Pagination                                                                    | Links inherit Button density; ellipsis height follows density without changing its width or icon size.                                                                                      | Ellipsis reserves at least 2dp above and below its icon.                                                        |
| NavigationDrawer                                                              | Items and section triggers share density-adjusted minimum height.                                                                                                                           | At least 4dp above and below content; wider layout and icons stay unchanged.                                    |
| NavigationRail                                                                | Expanded item and indicator heights follow row size, density and content. Collapsed row height and outer block padding follow density; the icon target and stacked label retain their size. | Expanded rows reserve at least 4dp above and below content; collapsed rows at least 2dp outer padding per side. |
| Dialog / Snackbar / DatePicker / TimePicker                                   | Focused interaction and feedback preserve their spacing, including nested actions.                                                                                                          | Density resets to zero; typography still inherits the theme.                                                    |
| Checkbox / Radio / Switch / Slider                                            | Control geometry and interaction targets are not spacing to remove.                                                                                                                         | No density transformation.                                                                                      |
| FAB / FAB menu                                                                | Dedicated action/navigation sizes remain their existing specifications.                                                                                                                     | No additional density transformation.                                                                           |
| Other containers, sheets, Popover, Tooltip, Badge, progress, layout utilities | Own layout or content determines dimensions.                                                                                                                                                | No global scaling. Nested density-aware components inherit unless a surface explicitly resets density.          |

There is no universal numeric density clamp. Each component stops consuming
negative steps when its remaining whitespace reaches its floor. Positive values
add whitespace. The floors are library decisions, not universal Material sizes.
Explicit component dimension tokens retain precedence; consumers supplying them
own their geometry.

## Theme ownership

Theme source data and preset definitions own default tokens, typography presets
and preset density. Generated theme CSS contains one resolved token declaration per
name. Shared component CSS contains no default theme selection. Consumers load one
theme alongside shared styles. The documentation editor uses the same typography and density presets. Theme generation
is an internal build step; it is not a consumer API.
