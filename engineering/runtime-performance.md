# Component Runtime Performance

This document records the runtime ownership and performance constraints established while optimizing high-cardinality
component lists. It applies to action title tooltips, press shape morphing, dropdown dismissal, Slider and progress
animation, and Tabs indicator measurement.

The common problem was not one expensive operation. It was inexpensive per-instance setup multiplied by hundreds or
thousands of components: generated DOM, CSS anchors, event listeners, observers, animation frames, and Vue updates.

## Design Rules

1. Vue owns semantic state, props, accessibility attributes, and structural rendering.
2. A document-scoped runtime owns browser resources shared by unrelated component instances.
3. Closed, hidden, or otherwise inactive components do not retain viewport, dismissal, pointer-end, or animation
   listeners.
4. Per-frame presentation may update runtime-owned DOM properties directly when routing it through Vue would render a
   component every frame.
5. Observers with a component lifetime stay alive and update their observed target set incrementally.
6. Native browser behavior, such as `popover="auto"` light dismissal, takes precedence over duplicate library-level
   listeners.

A shared runtime is not a store. It must not own application data or canonical component state. It is appropriate only
when it owns a browser resource whose natural lifetime and consumer set span multiple component instances.

## Runtime Inventory

| Area                     | Owner                                                            | Lifetime and responsibility                                                                                                                              |
| ------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Action title Tooltip     | `src/internal/actionTitleTooltip.ts` and `sharedPlainTooltip.ts` | One lazy plain Tooltip per document; only the active trigger owns an anchor and tooltip setup state.                                                     |
| Plain `v-tooltip`        | `src/internal/sharedPlainTooltip.ts`                             | Generated, plain, non-interactive tooltips share delegated events and lazy DOM. Interactive, rich, or authored targets remain independent.               |
| Delegated rich Tooltip   | `src/composables/useDelegatedTooltip.ts`                         | High-cardinality non-interactive rich content uses a bounded Vue slot pool and container event delegation; interactive rich surfaces remain independent. |
| Fallback viewport        | `src/internal/sharedViewportChange.ts`                           | Non-anchor Tooltip instances share one document scroll/resize listener pair and one pending rAF.                                                         |
| Press shape morph        | `src/internal/pressShapeMorph.ts`                                | One delegated listener set per document; window pointer-end listeners exist only during an active press.                                                 |
| Manual outside dismissal | `src/internal/outsidePointerDown.ts`                             | One capture listener per document while at least one manual popover is open.                                                                             |
| Shared animation frames  | `src/internal/sharedAnimationFrame.ts`                           | One browser rAF per document for all active registered animation controllers.                                                                            |
| Loading animation        | `src/components/LoadingIndicator/loadingIndicatorAnimation.ts`   | One reduced-motion query and one shape calculation per simultaneous-start cohort and frame.                                                              |
| Tab geometry             | `src/components/Tabs/TabList.vue`                                | One persistent ResizeObserver and MutationObserver per TabList; target membership changes incrementally.                                                 |

All runtimes must delete their per-document entry when their last registration is cleaned up. Tests should cover the
first registration, multiple consumers, active/inactive transitions, last cleanup, and re-registration after cleanup.

## Action Title Tooltip Baseline

`Button`, `IconButton`, and `FloatingActionButton` convert `title` into
`data-m3-action-title-tooltip`. Registering a trigger must not create Tooltip DOM or an anchor. The shared Tooltip and
the active anchor are created only when focus, hover, or touch long-press opens a trigger.

The active trigger may be observed for content changes, but unopened triggers must not receive individual observers,
listeners, Tooltip elements, or anchors. Recycling a trigger must release its active state synchronously.

## 1. Press Shape Morph

Press morph attributes use Vue vnode lifecycle hooks to register the concrete root element without adding DOM event
listeners to every component. Pointer and click events are delegated through the document runtime.

The runtime must preserve:

- disabled anchor and label event blocking;
- pointer identity and multi-pointer rejection;
- minimum pressed duration;
- completion when pointerup occurs outside the component;
- immediate cleanup when an active element is recycled or unmounted.

The public composable methods remain available for callers that invoke press handling manually.

## 2. Plain and Rich Tooltip Boundary

The shared directive runtime is used only when all of these are true:

- the Tooltip is generated by the directive;
- `interactive` is false;
- the visual variant is `plain`.

Interactive or rich surfaces retain independent DOM and `role="dialog"` behavior because pointer/focus transfer into
the surface is part of their contract. An existing target also remains independent because its ownership belongs to
the caller.

Fallback scroll and resize positioning listeners are installed only while a Tooltip is open. CSS anchor positioning
does not need those listeners.

For high-cardinality dynamic content that needs Vue markup but does not accept focus or pointer interaction inside the
surface, use `useDelegatedTooltip`. It owns a bounded slot pool and delegates pointer/focus handling from the list
container. Do not use it for rich surfaces containing buttons, inputs, or other focusable content: those surfaces keep
independent `v-tooltip` instances so trigger and surface lifetimes remain coupled. The first pointer hover opens
immediately; a short switch debounce applies only while another anchor is already active, and keyboard focus switches
immediately.

When CSS anchor positioning is unavailable, open Tooltip instances register with a document-scoped viewport runtime.
The runtime coalesces scroll and resize events into one animation frame and removes its listeners after the last open
instance closes.

## 3. Slider Global Listeners

Slider viewport positioning listeners are registered when the value indicator becomes visible and removed when it
becomes inactive.

Slider reads `WheelEvent.altKey` directly. It must not use a global key-modifier composable merely to interpret one
wheel event. See [slider-performance.md](./slider-performance.md) for the additional constraint that animated percent
updates must not pass through Vue or perform per-frame layout.

## 4. FloatingActionButtonMenu Global Listeners

FloatingActionButtonMenu resize, capture-scroll, and outside-pointer listeners exist only while the menu is open. The
close and unmount paths both remove them.

## 5. Dropdown and Context Menu Dismissal

`popover="auto"` and `popover="hint"` use native light dismissal. Only manual popovers join the shared outside-pointer
runtime.

## 6. Flat Progress Layout

`LinearProgressIndicator` needs computed style, bounds, and ResizeObserver data only for its wavy SVG path. The default
flat shape must not call `getComputedStyle`, read bounds, or create a ResizeObserver. Switching to wavy starts layout
tracking; switching back to flat disconnects it.

## 7. Indeterminate Progress Animation

### LoadingIndicator

Visibility delay and ARIA state remain reactive component state. Animation phase and SVG presentation belong to the
Loading animation runtime.

Visible instances share one browser frame. Instances activated before the same frame form a cohort, start from elapsed
zero together, and reuse one `getLoadingIndicatorFrame()` result per frame. This preserves restart behavior while
avoiding repeated interpolation of the large morphable path. The runtime writes SVG `d` and `transform` directly.

The template provides only the static initial path. Do not add a reactive frame, animated `d`, or animated style
binding to the template: a component update could then overwrite runtime-owned presentation and reintroduce Vue work
on every frame.

The document runtime also owns one `prefers-reduced-motion` query and listener. Hidden instances leave the active set;
when the active set becomes empty, its shared frame controller stops.

### CircularProgressIndicator

Layout, determinate progress, props, and ARIA remain in Vue. Indeterminate animation uses the document frame scheduler,
calculates the current active and track paths from the component's latest layout snapshot, and writes those paths
directly.

This reduces N browser rAF callbacks to one and removes per-frame Vue component rendering. Unlike LoadingIndicator,
Circular instances can have different sizes and wave parameters, so path calculation currently remains per instance.
Grouping identical geometry is a possible later optimization and should be justified by a browser trace before adding
that complexity.

Determinate `CircularProgressIndicator` and `LinearProgressIndicator` still use `useAnimatedNumber`. Any future change
to their presentation should follow Slider's direct-write pattern and must first verify layout, style recalculation,
and paint behavior in Chrome.

## 8. Tab Indicator Geometry

Each TabList owns one ResizeObserver for its list and current Tab elements. A MutationObserver distinguishes between
content and membership changes:

- character data changes queue an indicator measurement but do not rebuild observers;
- child-list changes incrementally observe new Tabs and unobserve removed Tabs, then queue measurement;
- active value and orientation changes only queue measurement.

The window resize listener is a fallback used only when ResizeObserver is unavailable. Indicator updates are coalesced
to one pending rAF without repeatedly cancelling and requesting another frame.

Keep character-data observation. In fixed-width Tabs, label content can change the indicator width without changing
the outer Tab's observed size.

## Measurements

The reproducible action benchmark is documented in
[`benchmarks/action-title-tooltip/README.md`](../benchmarks/action-title-tooltip/README.md), with recorded results in
[`RESULTS.md`](../benchmarks/action-title-tooltip/RESULTS.md).

For 2,000 mixed action components across mount, an update of every title, five complete keyed-list recycle rounds, and
unmount:

| Metric                     |   Original | Shared Tooltip and interaction runtimes |
| -------------------------- | ---------: | --------------------------------------: |
| Listener registrations     |    300,000 |                                      90 |
| Unopened Tooltip elements  |      2,000 |                                       0 |
| Unopened anchored triggers |      2,000 |                                       0 |
| Five recycle rounds        | 2,947.7 ms |                                962.3 ms |

The isolated ten-batch Tooltip memory benchmark leaves zero Tooltip elements and anchors after cleanup.

The delegated rich Tooltip benchmark is documented in
[`benchmarks/delegated-tooltip/README.md`](../benchmarks/delegated-tooltip/README.md), with recorded results in
[`benchmarks/delegated-tooltip/RESULTS.md`](../benchmarks/delegated-tooltip/RESULTS.md). For 1,000 non-interactive
dynamic triggers and three keyed-list recycle rounds, a five-load headless Chrome sample produced:

| Metric                           | Bounded delegated slot pool | Per-instance target Tooltip |
| -------------------------------- | --------------------------: | --------------------------: |
| Mount                            |                      5.8 ms |                     77.0 ms |
| Three recycle rounds             |                      8.7 ms |                    257.0 ms |
| Unmount                          |                      0.7 ms |                     26.8 ms |
| Listener registrations           |                           7 |                      76,000 |
| Tooltip elements after mount     |                           3 |                       1,000 |
| Anchored triggers after mount    |                           0 |                       1,000 |
| `aria-describedby` after recycle |                           0 |                       1,000 |

The timing sample is directional; the deterministic DOM and listener counts are the primary regression signals.

Instrumentation used during progress investigation showed the following deterministic scaling before the shared frame
runtime:

| Workload                                | Browser rAF callbacks per frame |     SVG `d` patches over 30 frames |
| --------------------------------------- | ------------------------------: | ---------------------------------: |
| 100 LoadingIndicator instances          |                             100 | 1,800, plus rotation style updates |
| 100 CircularProgressIndicator instances |                             100 |                              5,800 |

After optimization, each workload schedules one browser rAF. Loading cohorts calculate one path per frame; Circular
keeps per-instance path calculation but performs no per-frame Vue state write.

For a 100-Tab list, 50 active-value updates previously produced 51 ResizeObserver instances, 5,151 calls to
`observe()`, and 50 disconnects. The persistent observer design keeps one instance and the original 101 observations;
active-value and orientation updates perform no observer operations.

JSDOM timing gathered during investigation is directional only and is not a release threshold. Browser traces are the
authority for layout, style, paint, and frame-budget claims.

## Verification

Run focused behavioral and lifecycle tests while changing these paths:

```sh
pnpm exec vitest run \
  src/internal/actionTitleTooltip.test.ts \
  src/internal/sharedViewportChange.test.ts \
  src/internal/sharedAnimationFrame.test.ts \
  src/composables/useDelegatedTooltip.test.ts \
  src/composables/usePressShapeMorph.test.ts \
  src/directives/Tooltip/vTooltip.test.ts \
  src/components/LoadingIndicator/LoadingIndicator.test.ts \
  src/components/CircularProgressIndicator/CircularProgressIndicator.test.ts \
  src/components/LinearProgressIndicator/LinearProgressIndicator.test.ts \
  src/components/Slider/Slider.test.ts \
  src/components/Tabs/Tab.test.ts
```

Then run the project gates:

```sh
pnpm exec vitest run
pnpm run check
pnpm exec vite build --no-minify
```

For animation changes, a warmed Chrome trace should show:

- one shared browser animation callback rather than one callback per instance;
- no Vue component update, `patchAttr`, or `patchStyle` stack caused by indeterminate frames;
- no layout reads in animation callbacks;
- no retained animation callback after the last active instance is hidden or unmounted.

## Regression Checklist

- Does mounting a closed or hidden component allocate global listeners, DOM, anchors, observers, or frames?
- Does an active-only resource stop on every close, disable, recycle, and unmount path?
- Is rich or interactive Tooltip behavior accidentally routed through the plain shared runtime?
- Does a frame callback mutate a Vue ref that is bound to animated DOM?
- Can a template update overwrite a DOM attribute owned by an animation runtime?
- Is a ResizeObserver rebuilt when only selection or orientation changed?
- Is native popover behavior duplicated by a document listener?
- Does the last runtime registration remove document-level state and allow clean re-creation?
