# Styling

## Choosing appearance and density

Start with the component's semantic role, then choose its visual appearance and size independently.

| Need                                                | Component / choice                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Choose a value                                      | Select or Combobox; use SelectItem for custom or virtual result rows.               |
| Invoke a command or open a submenu                  | Menu with MenuItem.                                                                 |
| Present general list content or navigation          | ListItem; choose button, link, or non-interactive presentation semantics.           |
| Dense property panels and frequently traversed rows | Standard Slider and ListItem, with compact field sizes.                             |
| Prominent controls or rich navigation surfaces      | Expressive Slider or ListItem when the larger geometry and motion suit the surface. |

Slider and ListItem default to `appearance="standard"`. Expressive preserves their original appearance. This is not a library-wide variant: use each component's documented API rather than passing `appearance` to every control. For ListItem, standard keeps its active indicator at full width without expansion or press morph. SelectItem uses this restrained presentation for both ordinary and virtual lists; keyboard activity is distinct from selection.

Use `size` to choose supported component dimensions, and public tokens for finer adjustments. Small visuals do not require small hit areas: Slider separates thumb and track dimensions from its target size. Pair a Slider with TextField for exact input; see [Slider](../components/slider#precise-numeric-input). TextField, Select and Combobox support the same 32px, 40px and 56px field heights. Allow space for floating labels; see [field spacing](./field-layout).

Choose button emphasis by action importance. Filled is available for the unique primary action, not required for every primary action. Routine actions use text/outlined buttons or standard icon buttons; Dialog actions use text. Keep focus visible in both themes. Prefer colors from semantic tokens, and verify long labels and narrow containers before reducing spacing further.

The sections below explain how to customize these choices without depending on private component DOM.

Customize component styles with CSS variables first.

When a variable cannot express the desired result, override a specific `data-part`. M3 Vue components expose a stable CSS API through `data-scope` and `data-part`. Global styles can use these attribute selectors directly. In an SFC's `<style scoped>`, use `:deep()` only when you need to cross a component boundary to reach an internal part.

## CSS token layers

Components use five CSS token layers:

1. `--md-sys-*`: global Material system tokens for theme-level configuration. Avoid overriding these locally on an individual component instance.
2. `--md-shape-*`, `--md-control-*`, and `--md-cursor-*`: library semantic tokens that map system tokens to shared shape, control-outline, and interaction-cursor roles with a small set of variables.
3. `--md-color-container`, `--md-color-on-container`, `--md-state-layer-color`, and `--md-icon-size`: contextual tokens that let parent components pass container, content, state-layer colors, and icon size to children. Set `--md-icon-size` on the smallest icon container the component owns, so it does not affect unrelated descendant icons.
4. `--md-<component>-*`: public component tokens and the recommended entry point for component-level customization.
5. `--_*`: private component tokens used only for implementation details and not exposed as public API.

Components declare public-token placeholders with `:where(:root)` and a value of `initial`. This gives editors and the CSS API an explicit declaration; it is not the default value. Actual defaults live in private-token fallbacks on component roots. This keeps WebStorm from having to resolve deeply nested `var()` fallbacks and prevents component CSS load order from overriding user `:root` or local customizations.

Public component tokens cover parts or stable states with clear meaning, such as container, label, selected, unselected, error, and disabled. Transient interaction states such as `hover`, `focus`, and `pressed` should use the state layer rather than expanding into a complete matrix of color tokens.

Prefer each component's `--md-<component>-*` tokens for new customizations. Legacy `--md-comp-*` tokens are not public API.

Ordinary actions and real URL links use separate global cursor tokens. To use the default arrow cursor for a desktop-app feel, see [Interaction Cursors](/guides/interaction-cursors).

The **Styling** table on each component page is generated from explicit metadata and lists only recommended public tokens. Metadata is split by component under `docs/.vitepress/components/style-tokens/<ComponentName>.ts`; the shared `style-token-meta.ts` entry point only maps component names to metadata.

## Theme-level shape tokens

To apply a consistent corner style across the library, override a small set of semantic `--md-shape-*` tokens instead of changing each `--md-<component>-*` token or `data-part` individually.

The Shape control at the top right of the documentation writes these variables to the document root, so changes apply to components across the site.

```css
:root {
  --md-shape-action: var(--md-sys-shape-corner-extra-large);
  --md-shape-field: var(--md-sys-shape-corner-large);
  --md-shape-field-square: var(--md-sys-shape-corner-medium);
  --md-shape-chip: var(--md-sys-shape-corner-small);
  --md-shape-card: var(--md-sys-shape-corner-medium);
  --md-shape-popover: var(--md-sys-shape-corner-large);
  --md-shape-compact: var(--md-sys-shape-corner-extra-small);
  --md-shape-overlay: var(--md-sys-shape-corner-extra-large);
  --md-shape-indicator: var(--md-sys-shape-corner-full);
  --md-shape-fab: var(--md-sys-shape-corner-large);
}
```

To align the square, pressed, or selected morph of actions, override the corresponding action semantic tokens:

Use a bounded corner value for `--md-shape-action`; avoid setting it to `--md-sys-shape-corner-full`, which can make corner animations on Button, IconButton, and similar components jitter. Square actions derive proportionally from `--md-shape-action` by default. Override the tokens below only when square, pressed, or selected shapes need to differ from that baseline.

```css
:root {
  --md-shape-action-square: var(--md-sys-shape-corner-small);
  --md-shape-action-pressed: var(--md-sys-shape-corner-extra-small);
  --md-shape-action-selected: var(--md-sys-shape-corner-medium);
}
```

Override a component public token only when that component needs to differ from the global semantic:

```css
:root {
  --md-outlined-text-field-container-shape: var(--md-sys-shape-corner-small);
}
```

Outlined Buttons and TextFields of the same size share the control-outline tokens in their resting state. To adjust control borders consistently, override:

```css
:root {
  --md-control-outline-color: var(--md-sys-color-outline-variant);
  --md-control-outline-width-extra-small: 0.0625rem;
  --md-control-outline-width-small: 0.078125rem;
  --md-control-outline-width-medium: 0.09375rem;
}
```

```css
.custom-checkbox {
  --md-checkbox-color: var(--md-sys-color-tertiary);
  --md-checkbox-on-color: var(--md-sys-color-on-tertiary);
  --md-checkbox-unselected-outline-color: var(--md-sys-color-tertiary);
}

.power-progress {
  --md-progress-indicator-color: v-bind(powerConsumptionColor);
}
```

To customize stable states such as disabled, override the corresponding component tokens:

```css
.custom-checkbox {
  --md-checkbox-disabled-color: var(--md-sys-color-outline);
  --md-checkbox-disabled-opacity: 0.5;
}
```

## data-scope and data-part

- **`data-scope`** identifies a component type, such as `button`, `text-field`, or `menu-item`.
- **`data-part`** identifies an element within a component, such as `root`, `label`, or `leading`.

Component roots use `data-part="root"`. Passing a class to an individual component instance is the preferred way to style its root. This uses ordinary Vue class fallthrough; it is not an authorization mechanism provided by scope-boundary. Accessing an internal `data-part` from a parent is an explicit deep customization.

In a scoped SFC with `@chillet/vue-scope-boundary`, positive HTML type selectors such as `button`, `.toolbar > button`, and `button.primary` match only native elements written by that SFC. Plain class, ID, and attribute selectors retain Vue's native behavior and can match child component roots. Avoid short class-name collisions with component prefixes, BEM, CSS Modules, or another naming convention.

## Usage

In global styles, use attribute selectors directly:

```css
[data-scope='text-field'] [data-part='label'] {
  font-weight: bold;
}
```

In a scoped SFC, use `:deep()` to make an intentional component-boundary crossing explicit:

```css
/* Customize the TextField label */
[data-scope='text-field'] :deep([data-part='label']) {
  font-weight: bold;
}

/* Customize the MenuItem label inside Menu */
[data-scope='menu-item'] :deep([data-part='label']) {
  color: red;
}
```

If you only need to style a component root, pass a descriptive class to the instance and use a plain class selector:

```vue
<Button class="checkout-action">Checkout</Button>

<style scoped>
.checkout-action {
  inline-size: 100%;
}
</style>
```

Do not add an internal root tag or private class to these rules. `button.checkout-action` is treated as a dependency on a private root tag and matches only `<button>` elements written by the SFC. `.m3-button.checkout-action` depends on the component's internal implementation.

## Inspect component anatomy

Each component documentation page includes an **Anatomy** section that lists its `data-scope` and `data-part` attributes and supports interactive highlighting.
