# Slider Performance Notes

This document records the performance constraints behind `Slider`, especially the animated value position and value indicator. Keep it in mind when changing `src/components/Slider/Slider.vue` or `src/components/Slider/Slider.css`.

## Background

The original issue was visible in `rakka-kb-configurator` on the `TriggerDistance` slider. Chrome Performance traces showed noticeable jank while the displayed slider value animated toward the real value.

The important trace findings were:

- `Layout` dominated main-thread time.
- Each `animationStep` from `useAnimatedNumber` was followed by Vue DOM patching, including `patchAttr` and `patchStyle`.
- Those patches invalidated `#document` layout, causing repeated document-level relayouts during the value animation.
- Switching track/handle movement to `translate` and `clip-path` helped, but did not fully fix the issue while the animated `--percent` was still a Vue template style binding.
- CSS anchor positioning for the value indicator also caused layout while the anchored handle moved. In an isolated Chromium trace, a popover using `position-anchor` still produced repeated `Layout` events during `--percent` updates.

## Required Behavior

The current implementation is designed around these requirements:

- Value animation must remain. Direct jumps are not acceptable for normal programmatic, wheel, or non-drag input changes.
- Slider visuals must remain consistent with the Material-style value indicator.
- The value indicator must remain a real manual popover so it enters the browser top layer and is not clipped or hidden by parent overflow or stacking contexts.
- Animated frames must not trigger Vue component re-rendering, document layout, or value indicator geometry reads.

## Implementation Shape

Animated slider position is published through `--percent`, but animated frame updates bypass Vue's renderer:

- Slider internals that need the animated percent are marked with `data-slider-percent-target="true"`.
- `refreshValueDisplayedStyleElements()` collects those elements after mount and structural changes.
- `syncValueDisplayedStyle()` writes `--percent` directly with `element.style.setProperty`.
- `useAnimatedNumber` calls `syncAnimatedValuePresentation()` on each animation frame.

This avoids Vue `patchStyle` or `patchAttr` work during every animation frame.

The value indicator uses a manual popover without CSS anchor positioning:

- The element keeps `popover="manual"` and `vtt-popover`.
- Opening and closing are controlled by Slider state.
- `syncValueIndicatorPosition()` reads the slider rect only when the popover opens, when placement/direction changes, on window scroll/resize, or when the slider resize observer reports a size change.
- CSS positions the fixed popover from those viewport variables, then follows the animated handle using the same `--percent` transform calculation.

One layout when the browser opens a popover is acceptable. Repeated layout during the `--percent` animation is not.

## Pitfalls

Do not reintroduce any of these patterns for Slider value animation:

- Binding animated `--percent` through Vue template `:style` on track, handle, stop-indicator containers, inset icons, or value indicator.
- Calling `getBoundingClientRect`, `clientWidth`, or `clientHeight` from the animation frame callback.
- Using shared `setupTooltip()` or CSS anchor positioning for the Slider value indicator while it needs to follow the animated handle.
- Replacing the value indicator with an ordinary absolutely positioned child inside `.m3-slider`; that avoids layout but can be clipped or visually hidden by ancestor overflow and stacking contexts.
- Moving the value indicator position with layout properties during animation. Use transform/translate-derived movement instead.

## Trace Expectations

When recording a Chrome trace after the value indicator is already open and the value animation is running:

- `animationStep` should not be followed by Vue `patchAttr` or `patchStyle` stacks.
- `InvalidateLayout` should not point at `#document` from Slider animated percent updates.
- `Layout` during warmed animated frames should be zero or unrelated to Slider animation.
- `UpdateLayoutTree`, paint, prepaint, and layerization may still appear because custom properties and paint output change.

## Validation Commands

For behavior or performance-sensitive Slider changes, run the focused tests first and then broaden as needed:

```sh
vp test run src/components/Slider/Slider.test.ts src/directives/Tooltip/vTooltip.test.ts
vp lint
vp check
vp build --no-minify
```

For this specific issue, a small Chromium trace was also used to verify that a warmed manual popover value indicator produced `Layout 0.000ms` and `layout count 0` across 45 animated `--percent` frames.
