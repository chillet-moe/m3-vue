# Density and theme sizing

Density adjusts vertical spacing in 4dp steps. Fields also adjust horizontal padding
as described below; other horizontal geometry remains independent. Typography
and component size are independent; default icons use the bounded scaling described below. A theme preset selects typography
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
| IconButton                                                                    | Size selects icon and base height; density adjusts remaining vertical whitespace.                                                                                                           | At least 2dp above and below the icon. Icon size follows the bounded icon rule.                                 |
| Chip                                                                          | Label line height and icon determine content height.                                                                                                                                        | At least 2dp above and below; avatar/content must still fit.                                                    |
| TextField / Select / Combobox                                                 | Shared field geometry: input line height plus vertical space. Label clearance remains outside the outlined field. Multiline inputs grow with content.                                       | At least 4dp above and below content. Slot actions must fit without shrinking icons.                            |
| ListItem / List                                                               | Size selects minimum height and block padding. Actual grid content determines final height, including descriptions and accessories.                                                         | Block padding stops at 4dp per side; no fixed maximum height.                                                   |
| TreeView                                                                      | Size selects the shared row height; body-medium text retains its size and icons follow the bounded icon rule.                                                                               | At least 4dp above and below content; accessories can grow the row.                                             |
| Tabs                                                                          | Minimum height changes with density; label/icon layout remains intrinsic.                                                                                                                   | At least 4dp vertical breathing room; stacked icon and label must both fit.                                     |
| Menu / Select popup                                                           | Row minimum height and block padding follow density; intrinsic content can grow.                                                                                                            | Inherits density; block padding stops at 4dp per side.                                                          |
| InputOtp                                                                      | Each size keeps its cell width; height follows text line height plus density-adjusted whitespace.                                                                                           | At least 8dp total whitespace; explicit container-size tokens override both axes.                               |
| Breadcrumb                                                                    | Item minimum height follows density; text retains its dimensions and icons follow the bounded icon rule.                                                                                    | At least 2dp above and below content.                                                                           |
| Pagination                                                                    | Links inherit Button density; ellipsis height follows density with bounded icon sizing.                                                                                                     | Ellipsis reserves at least 2dp above and below its icon.                                                        |
| NavigationDrawer                                                              | Items and section triggers share density-adjusted minimum height.                                                                                                                           | At least 4dp above and below content; wider layout remains independent.                                         |
| NavigationRail                                                                | Expanded item and indicator heights follow row size, density and content. Collapsed row height and outer block padding follow density; the icon target and stacked label retain their size. | Expanded rows reserve at least 4dp above and below content; collapsed rows at least 2dp outer padding per side. |
| Dialog / Snackbar                                                             | Focused interaction and feedback preserve their spacing, including nested actions.                                                                                                          | Density resets to zero; typography still inherits the theme.                                                    |
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

Field horizontal padding changes by 2dp per density step, with a 4dp floor;
extra-small, small and medium start at 8/12/16dp. This keeps Select and Combobox
indicators, field icons and picker actions aligned with the field's changing
whitespace. Embedded action targets derive their inline expansion from that
padding, retaining 4dp to the outline. Explicit field padding tokens still win.
This rule does not change list indentation or standalone IconButton width presets.

## Picker geometry

DatePicker and DateRangePicker inherit density. Dates start at 48dp square, use
4dp density steps and retain a text-line-height plus 8dp floor. Calendar widths
derive from seven cells and surrounding padding, with a 280dp header floor.
On narrow viewports the default cells fit the available columns; explicit date
width/height tokens still override these defaults. Range bands use the same
rendered cell height. Month/year rows and picker actions inherit density.

TimePicker preserves the clock face and pointer coordinate system. Its display
and input rows share a content-aware 80dp baseline (57dp reference digits), with
room for the display font or two period labels plus at least 8dp whitespace.
Header, clock-area, input-area and footer spacing also follow density. The
surface scrolls when its contents exceed the viewport; the clock is not scaled.

## Icon geometry

Default action, field and row icons use `--density-icon`: 1dp per density step,
bounded to baseline ±4dp and at least 16dp, multiplied by `--md-icon-scale`
(clamped to 0.5–2). Explicit component sizes bypass this calculation. Inline
icons retain text-relative sizing. Selection-control geometry is independent.

Icon owns source calibration: the layout canvas stays fixed, while its glyph
uses `(5/6) / contentRatio`. The default ratio is nominal 5/6 for Symbols and 1
for SVG slots; a local prop overrides the inherited token. No glyph bounding-box
measurement or source registry is involved. Optical size follows the font size
within 20–48, including morphing icons.
