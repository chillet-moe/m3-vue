<script setup>
import CustomizationGallery from '../.vitepress/components/CustomizationGallery.vue';
</script>

# Customization

Choose a theme, set component defaults, then adjust the few styles that need to differ.

| Change                                | Use                                                        |
| ------------------------------------- | ---------------------------------------------------------- |
| Default or compact presentation       | A theme stylesheet                                         |
| Component size, shape or behavior     | `M3VuePlugin` options, subtree defaults or component props |
| Vertical whitespace inside controls   | `--md-density`                                             |
| Typography, colors and corners        | System and semantic CSS tokens                             |
| One component's appearance            | Its documented public tokens                               |
| Layout and spacing between components | A class on the component or its parent layout              |

## Component previews

Use the toolbar's **Customize** control to compare settings across these components. Choose a category; each
component name links to its full examples and API. Individual examples may set an explicit variant or size.

<CustomizationGallery />

## Theme selection

Import the shared styles and **one** theme at application startup:

```ts
import '@chillet/m3-vue/style.css';
import '@chillet/m3-vue/themes/default.css';
```

Use `themes/compact.css` instead of `themes/default.css` for smaller typography and density `-2`.
The default theme uses Material typography and density `0`. Both themes contain their final token values;
loading the compact theme does not require loading the default theme first.

Nuxt loads the default theme automatically. Use `m3Vue: { theme: 'compact' }` to select compact,
or `theme: false` if you import theme styles yourself.

## Component defaults

Set application defaults when registering the plugin:

```ts
app.use(M3VuePlugin, {
  shape: 'square',
  rowSize: 'extra-small',
  fieldSize: 'small',
  buttonDefaults: { size: 'small', pressShapeMorph: false },
  sliderDefaults: { appearance: 'standard', wheel: false },
  listItemDefaults: { size: 'small' },
});
```

| Option                                     | Applies to                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------- |
| `shape`                                    | Shared rounded/square shapes                                                           |
| `rowSize`                                  | Menu rows (including Select/Combobox menus), TreeView and navigation drawer/rail items |
| `fieldSize`                                | Single-line TextField, Select and Combobox                                             |
| `buttonDefaults`                           | Button size and press shape morph; ButtonGroup inherits press morph                    |
| `iconButtonSize`                           | IconButton                                                                             |
| `sliderDefaults`                           | Slider size, appearance, wheel input and value indicator                               |
| `listItemDefaults`                         | ListItem size and appearance                                                           |
| `appearance`                               | Shared Slider and ListItem appearance                                                  |
| `menuColor`                                | Menu and Select/Combobox menus                                                         |
| `datePickerDefaults`, `timePickerDefaults` | Picker preferences                                                                     |
| `snackbarDefaults`                         | Programmatic [Snackbar](../components/snackbar) preferences                            |

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

A component prop wins over subtree defaults, then application defaults, then the library default.
Explicit `false` overrides an inherited value; `undefined` inherits. Direct `provide(contextKey, value)` replaces
that context object, so use a defaults helper when you want to retain unspecified fields.

### Row sizes

Menu, TreeView, NavigationDrawer and NavigationRail share a `size` scale:

| Size               | Single-line base height |
| ------------------ | ----------------------- |
| `extra-small`      | 32px                    |
| `small`            | 40px                    |
| `medium` (default) | 48px                    |
| `large`            | 56px                    |
| `extra-large`      | 64px                    |

These are reference heights at density `0` with a 16px root font size. Text and icon sizes do not change.
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

Density applies to Button, ButtonGroup, IconButton, Chip, fields, InputOtp, ListItem, TreeView, Tabs,
menu rows (including Select/Combobox menus), Breadcrumb, Pagination and navigation drawer/rail items.
Only vertical whitespace changes: OTP cell widths, navigation widths, fonts and icons stay unchanged.
Collapsed rail items retain room for the icon target and stacked label, so they reach their density floor sooner.
Multiline content can grow taller. Dialog, Snackbar and date/time pickers reset inherited density to zero.
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

Container and foreground roles are separate pairs. Components resolve light/dark roles through `color-scheme`.
For nested custom content, `--md-color-container`, `--md-color-on-container` and `--md-state-layer-color` carry the
current container, foreground and state-layer colors.

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

Use library semantics for shared changes: `--md-control-outline-*` coordinates resting control borders,
[interaction cursor tokens](./interaction-cursors) coordinate cursors, and
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
