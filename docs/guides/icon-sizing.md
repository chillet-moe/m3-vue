<script setup>
import IconSizingLab from '../.vitepress/components/IconSizingLab.vue';
</script>

# Icon sizing playground

Use **Customize → Theme** to change density, the icon size multiplier and source content ratio. The first group follows the current settings; the comparison table fixes density per column while keeping the selected multiplier and ratio. Dashed outlines show the rendered source canvas, including its internal whitespace.

<IconSizingLab />

## Sizing rules

Component size selects the baseline. Icons paired with text derive that baseline and its bounds from the corresponding typography role's font size. Button uses its size-specific label/title/headline role; Chip, Menu and Breadcrumb use label-large; fields and ListItem use body-large; TreeView uses body-medium; navigation drawer and rail items use label-large and label-medium respectively. Density then changes the size by 1px per step within those bounds, followed by `--md-icon-scale`. At default typography the bounds are baseline ±4px with a 16px lower limit; these bounds scale with the typography role.

Standalone IconButton and Icon retain their size-based baselines. Explicit component icon-size tokens and `Icon size` bypass automatic sizing. Inline icons follow text and do not shrink with density.

```css
:root {
  --md-density: -2;
  --md-icon-scale: 1;
}
```

`--md-icon-scale` accepts a multiplier from 0.5 to 2. It changes default layout sizes; it does not resize text or selection-control geometry such as checkboxes and radios. The controls' existing content floors still apply.

## Source calibration

`--md-icon-content-ratio` describes the nominal visible fraction of an icon source's canvas, from 0.1 to 1. It is an optical calibration, not CSS padding or a measured bounding box for each glyph. Material Symbols use a nominal 5/6 reference. SVG slots default to 1; set `contentRatio` for a source with internal whitespace.

The layout box keeps its requested size. The rendered source is scaled by `(5/6) / contentRatio` around its center, preserving surrounding gaps and hit targets. A source ratio of 1 therefore draws a smaller canvas than a source ratio of 5/6 for the same layout size. Shapes retain their own optical differences rather than being cropped to identical bounds.

```vue
<Icon name="settings" />
<Icon :content-ratio="1">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 1v22M1 12h22" />
  </svg>
</Icon>
```

A local `contentRatio` overrides the inherited CSS token. When mixing icon sources, set the ratio on the source's Icon wrapper. Material Symbols also use their optical-size axis, bounded to 20–48, independently of layout size and calibration.

## Text-relative icons

`variant="inline"` retains its text-relative `1em` default and middle alignment.
