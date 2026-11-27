<script setup lang="ts">
import LocalButtonColors from '../demos/guides/LocalButtonColors.vue';
import LocalButtonColorsSrc from '../demos/guides/LocalButtonColors.vue?raw';
import CardControlColors from '../demos/guides/CardControlColors.vue';
import CardControlColorsSrc from '../demos/guides/CardControlColors.vue?raw';
import NestedColorScopes from '../demos/guides/NestedColorScopes.vue';
import NestedColorScopesSrc from '../demos/guides/NestedColorScopes.vue?raw';
</script>

# Customization

Start with a complete preset, then override only the preferences your application needs. Use the [preset preview](./presets) to compare a working layout and the component gallery. The documentation toolbar edits these same settings; its Code tab exports the preset import, plugin overrides and any CSS changes.

## Choose a preset

```ts
import { M3VuePlugin } from '@chillet/m3-vue';
import '@chillet/m3-vue/style.css';
import { compact } from '@chillet/m3-vue/presets/compact';

app.use(M3VuePlugin, { preset: compact });
```

The entry imports its theme stylesheet and supplies component defaults. Import one preset per application stylesheet. Use `defaultPreset` from `@chillet/m3-vue/presets/default` for the standard Material presentation.

| Setting                        | default  | compact     |
| ------------------------------ | -------- | ----------- |
| Typography                     | Material | Compact     |
| Density                        | 0        | -2          |
| Switch                         | medium   | small       |
| Fields                         | medium   | small       |
| Field labels                   | floating | external    |
| Button                         | small    | small       |
| IconButton                     | small    | extra-small |
| Menu, tree and navigation rows | medium   | small       |
| ListItem                       | medium   | small       |

Compact leaves visible field labels to the parent layout. The `label` prop remains an accessible-name fallback; it does not display a label or placeholder in external mode. See [Field layout](./field-layout#label-behavior) for above, beside-field and visually unlabeled examples.

Compact uses small fields with body-medium typography, matching small buttons in ordinary toolbar layouts. With the unmodified compact preset, both are 30px high at a 16px root font size. Fields retain at least 4px padding above and below their content, so they may stay taller than buttons at more negative densities. Dialogs and sheets inherit density and reduce their padding and section gaps. Progress indicators scale their geometry with body typography and density; their explicit size and thickness settings remain independent.

Compact keeps Slider and FAB at their existing defaults. It does not change shape, colors or interaction behavior. Typography still governs text-associated geometry, while density adjusts spacing.

The standalone `themes/default.css` and `themes/compact.css` files remain available for CSS-only theme selection; they do not set Vue component sizes. A preset entry already imports its stylesheet, so do not import a second theme alongside it. Nuxt's `m3Vue: { theme: 'compact' }` installs the compact defaults with its generated plugin; `theme: false` disables this selection. `directives: false` disables directive registration while preserving the selected preset.

## Override component defaults

```ts
app.use(M3VuePlugin, {
  preset: compact,
  switchSize: 'medium',
  buttonDefaults: { pressShapeMorph: false },
});
```

This keeps compact's button size while changing press behavior. Nested defaults merge by property; `undefined` inherits and explicit `false` overrides. Priority is **component prop → subtree default → application override → preset → component default**. Reactive refs remain reactive.

The customization panel preserves explicit component overrides when switching presets. An inherited choice displays the preset value; remove an override to follow the selected preset again. Choosing typography alone does not change the component defaults. Reset returns all settings to the default preset.

| Option                                     | Applies to                                                                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `shape`                                    | Shared component shapes                                                                                        |
| `rowSize`                                  | CommandPalette results, Menu rows (including Select/Combobox menus), TreeView and navigation drawer/rail items |
| `fieldLabelBehavior`                       | TextField, Select and Combobox label presentation (`floating` / `external`)                                    |
| `fieldSize`                                | Single-line TextField, NumberField, Select, Combobox, ColorField and SliderField                               |
| `buttonDefaults`                           | Button size and press shape morph; ButtonGroup inherits press morph                                            |
| `switchSize`                               | Switch (`small` / `medium`)                                                                                    |
| `iconButtonSize`                           | IconButton                                                                                                     |
| `sliderDefaults`                           | Slider size, appearance, wheel input and value indicator                                                       |
| `listItemDefaults`                         | ListItem size and appearance                                                                                   |
| `selectDefaults`                           | Select and Combobox selected checkmarks (`showSelectedIcon`)                                                   |
| `appearance`                               | Shared Slider and ListItem appearance                                                                          |
| `menuColor`                                | Menu and Select/Combobox menus                                                                                 |
| `datePickerDefaults`, `timePickerDefaults` | Picker preferences                                                                                             |
| `snackbarDefaults`                         | Programmatic [Snackbar](../components/snackbar) preferences                                                    |

For one subtree, use the existing defaults helpers. They inherit fields you omit and accept refs or computed values:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { provideButtonDefaults, provideSliderDefaults } from '@chillet/m3-vue';

const compact = ref(true);
provideButtonDefaults({ size: computed(() => (compact.value ? 'small' : undefined)) });
provideSliderDefaults({ wheel: false });
</script>
```

Direct `provide(contextKey, value)` replaces that context object; use a defaults helper when you want to retain unspecified fields.

### Row sizes

Menu, TreeView, NavigationDrawer and NavigationRail share a `size` scale:

| Size               | Single-line base height |
| ------------------ | ----------------------- |
| `extra-small`      | 32px                    |
| `small`            | 40px                    |
| `medium` (default) | 48px                    |
| `large`            | 56px                    |
| `extra-large`      | 64px                    |

These are reference heights at density `0` with a 16px root font size. Changing row size alone does not change text or icon sizes; typography and density still affect their respective dimensions.
Multiline content and accessories can grow the row. Collapsed rails also reserve room for their stacked icon and label.

Set `rowSize` in the plugin for application defaults, or use `provideRowSize` in an existing ancestor for one region:

```ts
import { provideRowSize } from '@chillet/m3-vue';

provideRowSize('extra-small');
```

The helper also accepts a ref or getter. A container's `size` overrides the inherited size; a
`MenuItem`, `TreeItem`, `NavigationDrawerItem`, `NavigationDrawerSection` or `NavigationRailItem` can override
its own size. Submenus inherit their menu's size; `MenuSubMenu.size` sets a different size for its trigger and contents.
An omitted or `undefined` size inherits.

Choose the row size first, then use `--md-density` to tune vertical whitespace. The customization panel's
**Components → Row size** control and **Code** preview use the same application option.

### Choosing appearance and density

`size` chooses component geometry and may also choose typography and icon dimensions. `appearance` selects the
standard or expressive treatment of Slider and ListItem. Component-specific appearance defaults take precedence
over the shared appearance setting, including a shared setting in a nearer subtree.

Use Select/Combobox for value selection, Menu for commands, and ListItem for general content or navigation.
Choose Button emphasis by action importance: routine actions use text/outlined buttons or standard IconButtons;
Dialog actions use text buttons.

## Density

Set density on the application or a particular region:

```css
.property-panel {
  --md-density: -2;
}
.property-panel__comfortable-section {
  --md-density: 0;
}
```

Each negative step removes up to 4dp of vertical whitespace; positive steps add whitespace. Text and icons retain
their sizes. Components stop shrinking when their content and minimum padding need the remaining space, so there
is no universal minimum height or numeric clamp. Explicit dimension tokens take precedence.

Density adjusts each component's chosen size; it is not a shared target height. Choose sizes first: a menu row
and an extra-small button can reach their content floors at different density values.

Typography, component size and density can be overridden independently of the preset. Text-associated icons and Checkbox, Radio and Switch geometry derive their default proportions from their typography role, so custom font sizes work without a preset-specific CSS override. Density then adjusts geometry and whitespace. Standalone IconButton and FAB sizes remain size-driven; explicit component dimensions override automatic sizing.

Density applies to Button, ButtonGroup, IconButton, Chip, Checkbox, Radio, Switch, fields, InputOtp, ListItem, TreeView, Tabs,
menu rows (including Select/Combobox menus), Breadcrumb, Pagination and navigation drawer/rail items.
Density primarily adjusts vertical whitespace. TextField, Select and Combobox also adjust horizontal padding by 2px per step, down to 4px, so field icons follow the surrounding whitespace. Explicit padding tokens override this rule. OTP cell widths, navigation widths, fonts stay unchanged. Default action and row icons adjust by 1px per density step within bounded sizes.
Collapsed rail items retain room for the icon target and stacked label, so they reach their density floor sooner.
Multiline content can grow taller. Dialog and Snackbar reset inherited density to zero. Date and time pickers inherit density: calendar cells and lists, time inputs and actions adapt, while the time-picker clock keeps its geometry.
Density does not adjust page gaps or automatically change at breakpoints. Preserve adequate interaction targets
when choosing a dense layout for touch input.

## Typography

Theme presets provide complete type scales. To adjust a role, set its size and line height together:

```css
:root {
  --md-ref-typeface-plain: 'Inter';
  --md-ref-typeface-brand: 'Inter';
  --md-sys-typescale-body-large-size: 0.875rem;
  --md-sys-typescale-body-large-line-height: 1.25rem;
}
```

Load the font in your application. Roles also expose `font`, `weight` and `tracking`; emphasized roles use the
`--md-sys-typescale-emphasized-*` prefix. Density stays independent of typography, while content-aware controls
can grow to accommodate larger text. Use the `m3-typo-*` classes to apply a type role to your own content.

## Colors

Use theme color roles rather than hard-coded colors in component internals. For example, change the primary color
and its foreground in each color scheme:

```css
:root {
  --md-sys-color-primary-light: #365e9d;
  --md-sys-color-on-primary-light: #ffffff;
  --md-sys-color-primary-dark: #aac7ff;
  --md-sys-color-on-primary-dark: #003062;
}
```

### Local color overrides

For fixed colors, define a CSS class for each six-digit hex seed at build time. Buttons, dialogs and ordinary DOM containers can all use the same class.

In a Vite app, add the theme plugin alongside the Vue plugin:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { m3ColorThemes } from '@chillet/m3-vue/vite';

export default defineConfig({
  plugins: [vue(), m3ColorThemes({ 'warning-theme': '#b3261e', 'teal-theme': '#008578' })],
});
```

Import the generated stylesheet once in your application entry, after your library styles and preset:

```ts
import 'virtual:m3-color-themes.css';
```

```vue
<Button class="warning-theme" variant="filled">Delete file</Button>
```

Descendants inherit colors from the nearest themed ancestor. Put the class on a container to theme its controls together, or on one control to leave its siblings in the surrounding theme.

To generate an ordinary CSS file from a Node build script, call the same generator and import the resulting file in your application entry:

```js
import { writeFile } from 'node:fs/promises';
import { generateColorThemeCss } from '@chillet/m3-vue/theme/css';

const css = generateColorThemeCss({ 'warning-theme': '#b3261e', 'teal-theme': '#008578' });
await writeFile('src/color-themes.css', css);
```

For a color chosen at runtime, `createColorTheme(seed)` from `@chillet/m3-vue/theme` returns a binding object for `v-bind`. Fixed classes and runtime bindings follow the same DOM inheritance and `color-scheme` rules.

For an individual adjustment, set the public role you want on that element. For example, `--md-sys-color-secondary` controls the Button focus ring, and `--md-sys-color-on-surface` supplies its disabled colors. `--md-sys-color-outline` and `--md-sys-color-outline-variant` default to translucent versions of `currentColor`. Set either unsuffixed role on a container to pass its color to descendants, or override the unsuffixed role on one component. Use `light-dark(...)` to specify separate values. On an ordinary element without the theme class, override the unsuffixed role directly: its inherited value was computed on the nearest theme root.

#### One Button

Apply `warning-theme` to **Delete file**. Clear **Select file** to see its disabled state. **Preview** keeps the page theme.

<DemoContainer :src="LocalButtonColorsSrc" :viewport="false">
  <LocalButtonColors />
</DemoContainer>

To change the enabled filled Button’s background and label, put `class="delete-file"` directly on the Button. A container can supply system color roles to its descendants, but each Button sets its own `--md-color-container` and `--md-color-on-container`.

```css
.delete-file {
  --md-color-container: var(--md-sys-color-error);
  --md-color-on-container: var(--md-sys-color-on-error);
}
```

Use `--md-state-layer-color` on the Button to override its state layer. Component-specific color tokens take precedence over their corresponding theme defaults.

#### Several controls in a Card

Apply `teal-theme` to the Card. Its CheckBox and Button inherit the palette. Outlined controls use a translucent `currentColor` by default. To set one Button’s exact outline color, set `--md-button-outlined-outline-color` on that Button.

<DemoContainer :src="CardControlColorsSrc" :viewport="false">
  <CardControlColors />
</DemoContainer>

#### Nested regions and Teleport

Open **Discard draft…** to see the Dialog in the nested warning theme. A teleported component inherits colors from its **destination in the DOM**. Here the target is the `.warning-theme` container. If you teleport to `body`, apply the theme class to the Dialog to keep that palette. A native modal keeps its DOM parent when it enters the browser's top layer.

<DemoContainer :src="NestedColorScopesSrc" :viewport="false">
  <NestedColorScopes />
</DemoContainer>

## Component shape modes

Set `shape` on the plugin or a component to choose a corner treatment:

| Shape     | Behavior                                                                          |
| --------- | --------------------------------------------------------------------------------- |
| `rounded` | Existing Material round treatment; surfaces retain their role-specific radii.     |
| `square`  | Existing Material square treatment where supported; it does not mean zero radius. |
| `minimal` | Subtle role-based corners: 2px, 3px, 4px or 6px.                                  |
| `sharp`   | 0px corners, including selected and pressed states.                               |

`minimal` uses the following role scale:

| Radius | Components                                                                          |
| ------ | ----------------------------------------------------------------------------------- |
| 2px    | CheckBox, calendar cells, menu/tree/list rows, navigation items and Snackbar        |
| 3px    | Button, IconButton, ButtonGroup, fields (including OTP), Chip and FAB menu items    |
| 4px    | Card, Menu, Popover, FAB, FAB menu trigger and navigation containers                |
| 6px    | Dialog, BottomSheet, SideSheet, DatePicker, DateRangePicker and TimePicker surfaces |

Press morphing remains independently configurable. When enabled, supported `minimal` controls use 2px while pressed;
when disabled, they retain their role radius. Selected controls also retain their role radius.
To use minimal corners without button press morphing, set
`{ shape: 'minimal', buttonDefaults: { pressShapeMorph: false } }` on the plugin.

Values above assume a 16px root font size. Shape does not change size, density or typography.

```ts
import { M3VuePlugin, provideShape } from '@chillet/m3-vue';

app.use(M3VuePlugin, { shape: 'minimal' });

// In an existing ancestor component's setup, override one region:
provideShape('sharp');
```

`provideShape` accepts a value, ref or getter. An omitted component `shape` inherits the nearest shared default;
component-specific context preferences and explicit props take precedence. `Menu`, `MenuSubMenu`, `TreeView`,
`NavigationRail`, `Select` and `Combobox` pass their shape to their owned descendants. `ButtonGroup` and
`NavigationDrawer` set their members' defaults through their component contexts. A Card or Dialog's local shape
changes its surface; use `provideShape` when the whole region should change.

Shape-aware components include Button, IconButton, ButtonGroup, ListItem, TextField, Select, Combobox, InputOtp,
CheckBox, Chip, Card, FloatingActionButton and its menu, Menu/MenuItem, TreeView/TreeItem, navigation drawer/rail items,
Popover, Dialog, Snackbar, BottomSheet, SideSheet, DatePicker, DateRangePicker and TimePicker.
Radio circles, switch thumbs, progress indicators, clock faces and avatars retain their semantic shapes.

`rounded` and `square` retain their existing press/selection behavior. `minimal` never morphs into a pill;
`sharp` keeps square corners while state layers, colors and other interaction feedback still work.
`Button.pressShapeMorph` and `ButtonGroup.pressShapeMorph` continue to disable press morphing.
Explicit component radius tokens override the mode; supplying those tokens means owning that component's geometry.
The semantic role tokens below customize the Material modes.

## Theme-level shape tokens

Semantic corner tokens coordinate components across the library:

```css
:root {
  --md-shape-action: 1.25rem;
  --md-shape-field: 0.75rem;
  --md-shape-field-square: 0.5rem;
  --md-shape-chip: 0.5rem;
  --md-shape-card: 0.75rem;
  --md-shape-popover: 0.75rem;
  --md-shape-overlay: 1.5rem;
}
```

Use bounded radii for `--md-shape-action`; a fully rounded value can cause unstable corner morphing.
Square, pressed and selected action shapes derive from it. Set `--md-shape-action-square`,
`--md-shape-action-pressed` or `--md-shape-action-selected` only when those shapes need separate treatment.
`--md-shape-compact`, `--md-shape-indicator` and `--md-shape-fab` control compact elements, indicators and FABs.

## Component styling

Each component page lists its public tokens under **Styling**. Use them for local exceptions:

```vue
<TextField class="search-field" label="Search" />

<style scoped>
.search-field {
  --md-outlined-text-field-container-shape: 0.5rem;
  inline-size: 100%;
}
</style>
```

Use `--md-control-outline-width-*` to coordinate resting Button and field border widths across sizes.
For TextField, Select and Combobox, `--md-control-outline-color` tints the resting outline. `--md-control-outline-color` also sets an exact shared color for fields and outlined Buttons; `--md-outlined-text-field-outline-color` overrides it for one TextField.
The [interaction cursor tokens](./interaction-cursors) coordinate cursors, and
[floating surface tokens](../utilities/elevation#floating-surfaces) coordinate overlays.
Variables starting with `--_` are private implementation details.

### data-scope and data-part

When props and tokens are insufficient, use the component's documented **Anatomy**. `data-scope` identifies the
component and `data-part` identifies a stable part. In scoped CSS, anchor deep selectors to your own class:

```css
.search-field :deep([data-part='label']) {
  font-weight: 600;
}
```

Use a plain class for root layout. Avoid private `.m3-*` classes or assumptions about a component's root HTML tag.
See [Vue Scope Boundaries](./vue-scope-isolation) for selector behavior.

## Prose

Use `.m3-prose` for rendered Markdown or other article content. Its element rules stop at embedded component parts
marked with both `data-scope` and `data-part`. Add `data-m3-prose-exclude` to the root of a custom widget to give it the
same boundary. Inherited properties such as font and color follow the normal CSS cascade. An inner `.m3-prose`
container can opt an article inside a widget back into prose styling.

## Field spacing

The parent layout owns spacing between fields. Opt in to the shared gap tokens on that layout:

```css
.form-fields {
  display: grid;
  row-gap: var(--md-field-row-gap);
  column-gap: var(--md-field-column-gap);
}
```

Both default to `1rem` and can be overridden globally or per region. Density does not change them.
The customization panel’s **Theme** tab adjusts these tokens. Its **Code** tab includes a `.form-fields` example;
apply that class to your parent layout and choose its columns for your form.
`labelClearance` adds space above a floating label in addition to the parent gap.
See [Field Layout](./field-layout) for a responsive grid example and interactive spacing preview.

## Try settings in the documentation

Open **Customize** in the toolbar to try theme, typography, shape and component settings. The selected preset
reflects the current values; after a custom edit, a group may have no selected preset. Changes persist only in this
browser and affect the documentation site. The **Code** tab shows the theme imports, plugin options and CSS needed
to apply the current settings in your app. Copy each file; the CSS contains only overrides of the imported theme.
**Reset all** resets the panel's settings; dark mode and sticky previews remain separate toolbar preferences.

For icon scaling and source calibration, see [Icon sizing](./icon-sizing).
