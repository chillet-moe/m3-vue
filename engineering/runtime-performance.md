# Component Runtime Performance

This document records the runtime ownership and performance constraints established while optimizing high-cardinality
component lists. It applies to action title tooltips, press shape morphing, dropdown dismissal, Slider and progress
animation, and Tabs indicator measurement.

The common problem was not one expensive operation. It was inexpensive per-instance setup multiplied by hundreds or
thousands of components: generated DOM, CSS anchors, event listeners, observers, animation frames, and Vue updates.

For the repository-wide audit, see the [coverage checklist and final report](runtime-performance-audit.md). It maps
the public entry points and shared runtime paths to this document, the benchmarks, and the browser evidence.

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
| Shared animation frames  | `src/internal/sharedAnimationFrame.ts`                           | One browser rAF and one lazy ResizeObserver per document for indeterminate SVG animations.                                                               |
| Loading animation        | `src/components/LoadingIndicator/loadingIndicatorAnimation.ts`   | One reduced-motion query and one shape calculation per simultaneous-start cohort and frame.                                                              |
| Tab geometry             | `src/components/Tabs/TabList.vue`                                | One ResizeObserver and MutationObserver per line TabList; target membership changes incrementally.                                                       |

All runtimes must delete their per-document entry when their last registration is cleaned up. Tests should cover the
first registration, multiple consumers, active/inactive transitions, last cleanup, and re-registration after cleanup.

## Element Document Ownership

`elementEnvironment.ts` indexes each document's resource bindings by their elements. The document observer looks up
bindings under removed nodes and checks registered roots directly when a removal contains more elements than the index.
Bindings in shadow or detached trees stay eligible for a refresh because their roots are outside the document tree.
Rebinding and page teardown preserve registration order. A temporary custom element detects later adoption of detached
elements after the original mutation record has been delivered.

## Action Title Tooltip Baseline

`Button`, `IconButton`, and `FloatingActionButton` convert `title` into
`data-m3-action-title-tooltip`. Registering a trigger must not create Tooltip DOM or an anchor. The shared Tooltip and
the active anchor are created only when focus, hover, or touch long-press opens a trigger.

The active trigger may be observed for content changes, but unopened triggers must not receive individual observers,
listeners, Tooltip elements, or anchors. Recycling a trigger must release its active state synchronously.

In a published Button-only consumer, deferring Tooltip setup to a dynamic import on title registration reduced
the initial JavaScript from 33,538 to 31,996 gzip bytes. A titled button then needed a second, 2,799-byte gzip
module. Across five cold Chromium runs per build with 90 ms simulated latency and 512 KiB/s downstream, first
Tab focus opened the tooltip after a median 2.1 ms with the static import and 91.8 ms with the dynamic import.
The same-build static control measured 1.9 ms. The untitled fixture showed no consistent first-contentful-paint
improvement. Keep the setup code available when the first keyboard focus reaches a titled button.

The shared plain runtime keeps a single registration directly in its trigger map. It uses an ordered array
when a trigger has multiple registrations and still picks the newest one with content. Once one registration
remains, the array is released.

Across five Chromium production runs per build against `d00510b`, median mounted JavaScript heap above the warmed
page fell from 3,072.1 to 3,049.8 KiB at 240 titled Buttons and from 14,996.8 to 14,891.1 KiB at 1,200. Same-build
controls measured 3,072.1 and 15,002.3 KiB. Both builds returned to the warmed DOM node and listener counts
after unmount, including after opening the first tooltip with Tab. All sampled button roots were collected.
Fixed-frame mount and title registration comparisons did not establish a consistent CPU reduction.

The three action components read their fallthrough attributes during render. They use Vue's current attributes
directly when no title is present and build a filtered object only when the native title must be omitted.
Tooltip registration still follows the trigger's mount, update, and unmount.

Against `e39337c`, five paired Chromium production runs reduced median mounted heap from 3,049.7 to
2,991.9 KiB at 240 titled Buttons and from 14,881.3 to 14,614.3 KiB at 1,200. Without titles, it fell from
2,773.3 to 2,724.5 KiB and from 13,584.2 to 13,341.4 KiB. The same-build heap controls were within 3 KiB
of baseline. DOM node and listener counts returned to their warmed values, and no sampled root was retained.
Fixed-frame tests did not establish a consistent CPU change. In the standalone
[published-package lifecycle benchmark](../benchmarks/action-title-tooltip/README.md), the mounted heap at
1,200 Buttons fell from 15,209.5 to 14,993.4 KiB with titles and from 14,272.6 to 14,098.8 KiB without titles.

## Link State

`useLinkTag` resolves the rendered tag, destination, disabled attributes, tab order, and button type in one
computed value. The action components, ListItem, MenuItem, Tab, and navigation items use the same result.
Their event handlers still own activation and suppression of disabled input.

Against `daf6e16`, five paired Chromium runs reduced median mounted heap above the warmed fixture from
14,615.3 to 12,144.2 KiB at 1,200 titled Buttons and from 13,346.1 to 10,873.5 KiB without titles. Same-build
controls were 14,614.3 and 13,342.7 KiB. After unmount, DOM nodes and listeners returned to their warmed
counts and all sampled roots were collected. Fixed-frame mount and content update traces kept the same
layout, style, paint, and raster task counts. In the standalone
[published-package lifecycle benchmark](../benchmarks/action-title-tooltip/README.md), the corresponding
1,200-Button heap measurements were 14,990.5 to 12,513.3 KiB with titles and 14,102.3 to 11,617.1 KiB without.

## Navigation Items

Drawer and Rail items derive selection once from the explicit prop or the owning navigation model. Drawer
items and sections resolve tooltip text only in icon-only mode, inside the computed tooltip binding.

Five paired Chromium production runs against `76175d0` measured median mounted JavaScript heap above an
empty page after garbage collection:

| 1,200 items | Baseline (KiB) | One selection computed (KiB) | Same-build control (KiB) |
| ----------- | -------------: | ---------------------------: | -----------------------: |
| Rail        |       15,880.2 |                     15,671.1 |                 15,883.4 |
| Drawer      |       15,232.2 |                     15,019.5 |                 15,231.3 |

Four separate paired runs isolated the Drawer tooltip change after the selection change. At 320 items,
heap fell from 5,131.2 to 5,085.7 KiB in expanded mode and from 5,350.8 to 5,294.0 KiB in icon-only mode.
Same-build controls measured 5,122.1 and 5,349.9 KiB, respectively.

Fixed Chromium frames matched for expanded and collapsed Rail and for expanded and icon-only Drawer during
pointer and keyboard selection in both color schemes. The fixed-frame Rail runs showed no consistent change in
renderer instructions.

## Pagination Links

PaginationLink resolves the Button variant during render from the explicit variant and current page state.
Five Chromium production runs against `6061285` reduced median mounted JavaScript heap above the warmed
fixture from 5,377.9 to 5,312.4 KiB for 40 paginators, and from 19,818.3 to 19,563.0 KiB for 160.
Same-build controls measured 5,376.4 and 19,820.6 KiB. Each paginator contains five page links and two
navigation controls. After unmount, DOM node and listener counts returned to the warmed values in both builds.
Across 64 light and dark Chromium frames at mobile and desktop widths, pixels, current-page semantics,
explicit variant overrides, and keyboard activation matched.

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

### Active ripple cleanup

StateLayer stores a cleanup callback directly for the first ripple on a control. It creates a Set only when a
second ripple overlaps. The callbacks still remove their helper nodes and cancel their timers when the control
is moved to another document or unmounted.

Five paired Chromium production runs against `db38d2c` paused cleanup timers while taking heap samples after
garbage collection. Values are median JavaScript heap growth over the mounted controls. The 80-control case
used normal motion; the 400-control stress case used reduced motion.

| Buttons with one ripple each | While active, before → after (KiB) | After cleanup, before → after (KiB) |
| ---------------------------: | ---------------------------------: | ----------------------------------: |
|                           80 |                      160.9 → 154.8 |                       117.8 → 118.2 |
|                          400 |                      417.1 → 385.6 |                       122.6 → 122.1 |

Seven native single-button runs per build measured 18.94 → 18.92 million renderer instructions for keyboard
activation and 34.39 → 34.12 million for overlapping pointer and keyboard activation. Same-build controls
measured 18.89 and 34.86 million. Forty fixed frames matched exactly across themes and motion preferences,
including overlap, partial and complete cleanup, document adoption and unmount.

To measure the published build, run the same benchmark against each revision:

```sh
pnpm run build
pnpm exec tsx benchmarks/state-layer/memory.ts .tmp/state-layer/memory/current
```

The output records the mounted, active and settled heap samples for every run. The published builds reduced
active heap growth from 198.5 to 192.3 KiB at 80 Buttons and from 469.5 to 438.2 KiB at 400. For the baseline,
copy `benchmarks/state-layer/` into a checkout of `db38d2c` and use a separate output directory. Set `CHROME_PATH`
to keep the Chromium binary fixed between revisions.

A distance probe reduces four identical corner calculations to one for ripples centered exactly on the control.
It matches 40 fixed frames, including keyboard and pointer overlap. In five rotated Chromium rounds the single
native keyboard activation measures 18.92 to 18.96 million renderer instructions (same-build: 18.94 million).
The 160-control keyboard burst measures 1,025.78 to 1,027.78 million (same-build: 1,034.88 million).
The probe stays isolated: it removes arithmetic but has no measurable renderer benefit. The wider probe that
selects the farthest corner even for nearly centered inputs also changes some duration strings because of rounding.

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

A controlled scan in place of sorting the full pool preserved slot reuse order but showed no consistent instruction
savings at three or 32 slots. In a separate three-slot trace, native focus and `showPopover()` accounted for 54 of
56 layout events during 14 focus transfers. Keep the native focus and top-layer behavior when evaluating this path.

When CSS anchor positioning is unavailable, open Tooltip instances register with a document-scoped viewport runtime.
The runtime coalesces scroll and resize events into one animation frame and removes its listeners after the last open
instance closes. Consecutive generated native popovers reset their offsets, read geometry, and apply positions in
separate phases. Authored targets and non-native surfaces keep their original update order because their position
can affect other triggers.

A document with one viewport update runs that callback directly. A single batched update still runs
preparation, measurement, then the measured write. In five paired Chromium runs over 120 scroll steps,
one generated fallback Tooltip used 292.93 → 292.31 million renderer instructions (same-build control:
292.95 million). The 12-Tooltip comparison showed no meaningful change. Generated, authored, and nested
Tooltip geometry and pixels matched across 28 fixed frames.

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

DatePicker, DateRangePicker and TimePicker open through their `open` model or exposed `show()`/`toggle()` methods.
Each picker initializes its draft before opening. Closed model changes do not update the hidden draft or calendar;
the current draft remains mounted through the exit animation. The native popover element is not exposed as a
second opening API. Native light dismissal still synchronizes the open model and runs exit completion.

### Snackbar stack updates

The popover stack updates its existing ordered array when a notification is added or removed. It publishes
each change through the existing shallow ref. The order, keyed item identity, exit completion, and host
disposal paths stay the same.

In five rotated Chromium rounds, ten batches of 160 notifications take 3,349.3 to 3,315.4 million
renderer instructions, with a second baseline at 3,341.1 million. All builds record 20 layouts, 20 style
updates, 40 paints and 120 raster tasks. One- and 12-notification instruction counts are within the same-build
variation. In separate V8 allocation samples including objects collected during the run, the same dense
workload samples 67.10 to 64.54 MiB (same-build: 66.75 MiB). Mounted heap increments after collection are
3,312.9 to 3,324.8 KiB (same-build: 3,319.9 KiB). Each dense run returns to 28 DOM nodes after unmount.

A Set also avoids copying the queue, but uses 3,324.6 million renderer instructions in the dense trace.
The array keeps the existing render and teardown representation. Sixty-six fixed frames match on the
release path. An additional 108 match with a shared diagnostic that exercises delayed exit and adding a
notification during exit. The trace runner and commands are in `.tmp/interaction-layout-audit/production/README.txt`.

## 6. Flat Progress Layout

`LinearProgressIndicator` needs computed style, bounds, and ResizeObserver data only for its wavy SVG path. The default
flat shape must not call `getComputedStyle`, read bounds, or create a ResizeObserver. Switching to wavy starts layout
tracking. Wavy instances share a ResizeObserver in their owning document, so all resize measurements run before Vue
updates any of the SVG paths. Equal resolved geometry keeps the current SVG snapshot. With multiple observed waves,
identical path inputs can reuse the latest path until the queued microtask clears it. Switching back to flat releases
that instance, and the last release disconnects the observer.

### SVG path coordinates

Linear, Circular and LoadingIndicator paths share the three-decimal coordinate formatter. It trims the rounded
decimal string directly. Large values retain native number spelling, while LoadingIndicator's fixed shape assets
use the bounded formatter. A straight line reuses its formatted Y coordinate, and a circular arc reuses its
formatted radius.

Five paired Chromium runs against `9d21a3e` give the following median instruction counts. The total includes the
renderer and the measured raster worker pool.

| Workload                              | Renderer before → after (M) | Total before → after (M) |
| ------------------------------------- | --------------------------: | -----------------------: |
| 1 linear indicator, 24 width changes  |                 57.7 → 56.1 |              73.3 → 72.4 |
| 60 linear indicators, mixed widths    |           1,406.4 → 1,282.5 |        1,967.3 → 1,864.4 |
| 1 wavy circular indicator, 144 frames |               139.4 → 136.0 |            176.7 → 173.3 |
| 100 wavy circles, mixed sizes         |           5,026.1 → 4,515.4 |        6,065.5 → 5,521.4 |

For 100 determinate wavy circles, increasing, reversing and settling the value reduces the total from 3.692 to
3.493 billion instructions over five pairs.

Style, layout, paint and raster task counts match. The dense linear trace includes more V8 background optimization
work, with essentially the same samples inside raster tasks. The measured total still falls. LoadingIndicator's
single-instance renderer count remains at 324.4 million. After unmount, the measured linear and circular pages retain
5–16 kB more JS heap; DOM counts match and no tracked progressbar nodes remain.

After three untimed resize sweeps, the dense linear case falls from 1.833 to 1.698 billion total instructions
across another five pairs. The bundled fixture still serves one script and the same stylesheet, with 27 additional
gzip bytes of script. All 1,812 fixed Chromium frames match in pixels and state, covering width changes, RTL,
fractional DPR, progress reversal, empty and full endpoints, hiding and reveal.
Firefox also matches 438 path, geometry and progress state samples.

The published-package fixture records five traces for each count. It advances one frame per linear width change and
two frames to settle, or 144 frames for circular and loading animation:

```sh
pnpm run build
pnpm exec playwright install chromium --only-shell
pnpm exec tsx benchmarks/progress-indicators/run.ts linear .tmp/progress-indicators/linear/current
pnpm exec tsx benchmarks/progress-indicators/run.ts circular .tmp/progress-indicators/circular/current
```

Copy `benchmarks/progress-indicators/` into a checkout of `9d21a3e`, build that package and use different output
directories for the baseline. Keep the browser and CPU configuration the same. Set `HEADLESS_SHELL` to use an existing
Chromium Headless Shell binary.

## 7. Indeterminate Progress Animation

### LoadingIndicator

Visibility delay and ARIA state remain reactive component state. Animation phase and SVG presentation belong to the
Loading animation runtime.

Visible instances share one browser frame. Instances activated before the same frame form a cohort, start from elapsed
zero together, and reuse one `getLoadingIndicatorFrame()` result per frame. This preserves restart behavior while
avoiding repeated interpolation of the large morphable path. The runtime writes SVG `d` and `transform` directly.
When the spring holds an endpoint, the path generator reuses that shape's formatted path as rotation continues.

The coordinate formatter keeps native three-decimal rounding and removes trailing zeros from the decimal string
directly. It preserves the previous normalization of small values and negative zero. Parsing the rounded string back
into a number and formatting it again is unnecessary for these bounded SVG coordinates.

Against `847498d`, five fixed-frame runs of 144 animation frames reduce single-instance renderer instructions from
388.6 to 324.4 million. The raster worker pool also executes V8 background optimization: its cold-window instructions
increase from 61.5 to 78.8 million while sampled work inside actual raster tasks stays at 93–94 samples. Including
all measured workers, the median total falls from 450.0 to 403.2 million instructions. After two animation cycles of warmup,
four pairs take 391.7 to 328.2 million renderer instructions, with 100.2 and 107.0 million on the worker pool.
For 100 instances, the warmed renderer counts are 3.842 and 3.783 billion because path interpolation is already
shared. Layout, paint and raster work remain necessary. The hidden heap difference is about 10.5 kB per page at
both one and 100 instances, including after unmount; DOM counts match and tracked nodes are released.

All 29,208 sampled complete paths and rotations match, and all 444 Chromium animation frames match in pixels and
state across two full morph cycles, three DPRs, hide and reveal. The same-build frame control also matches.
Chromium and Firefox both confirm zero hidden writes and catch-up before paint when the SVG is revealed.
The published-package benchmark above uses `loading` mode for five 144-frame traces each at one and 100 instances:

```sh
pnpm exec tsx benchmarks/progress-indicators/run.ts loading .tmp/progress-indicators/loading/current
```

Run the same fixture against a package built from `847498d` for a baseline, copying `benchmarks/progress-indicators/`
into that checkout.

The template provides only the static initial path. Do not add a reactive frame, animated `d`, or animated style
binding to the template: a component update could then overwrite runtime-owned presentation and reintroduce Vue work
on every frame.

The document runtime also owns one `prefers-reduced-motion` query and listener. Hidden instances leave the active set;
when the active set becomes empty, its shared frame controller stops.

The template and reduced-motion path reuse one static frame. Five paired runs with 600 mounted indicators used
4,486.6 → 4,469.9 KiB of heap above a warmed page. The same-build control used 4,484.3 KiB. Fixed-frame mount
traces did not show a consistent CPU change.

When the scheduler reports no other callback in a frame or reveal batch, the indicator computes the frame directly.
It only uses the shared frame cache when a peer could reuse the result. In four paired 120-frame runs, one indicator
used 278.0 → 274.2 million renderer instructions; same-build controls used 277.4 and 277.6 million. At 100
indicators, instructions stayed within same-build variation. Layout, style, paint and raster task counts matched.

Adding `contain: layout` to the indicator container did not reduce its 120 layouts at 100 instances. It increased
paint events from 126 to a median of 5,103 and changed the containing block for a fixed-position active SVG.
The container keeps its existing layout behavior.

The shared frame runtime observes running SVGs and suspends work when their layout boxes disappear, including when an
ancestor becomes `display: none`. Suspension retains each animation's start time. On reveal, the ResizeObserver
callback samples the document timeline and draws the current phase in the same rendering cycle. The component's own
`visible` and reduced-motion controls still stop the animation and reset its phase when it starts again.

### CircularProgressIndicator

Layout, determinate progress, props, and ARIA remain in Vue. Indeterminate animation uses the document frame scheduler,
reads the active and track paths for the component's latest layout snapshot, and writes them directly. Instances
with matching path geometry and elapsed time reuse the computed paths during synchronous frame delivery. Geometry
changes replace the component's path reader. Cached paths are released after delivery, and each instance keeps its
own animation clock.

CircularProgressIndicator uses the same suspension rule for indeterminate animation. The shared observer batches
circular layout measurements after visibility catch-up and before Vue patches the SVGs. Root measurements stay
active in determinate mode without scheduling animation.

Determinate `CircularProgressIndicator` and `LinearProgressIndicator` use `useAnimatedNumber`. The circular indicator
writes the live `d` attribute on mounted paths. Vue supplies the initial path data when each segment is created.
The linear indicator writes a non-inheriting custom property on the track and active segment as the displayed value
changes. A root style snapshot supplies the value on the first render and for new segments. Vue owns the progress state,
ARIA values, and styling props.

### LinearProgressIndicator

The starting clip edge animates as a percentage, so it can feed `clip-path` directly. The ending edge
retains its original number and calculation: changing its arithmetic altered clip coordinates in Firefox.
Across four pairs of 120 frames at the same animation times, 60 flat indicators use 5.639 → 5.504 billion
renderer instructions and 60 wavy RTL indicators use 4.721 → 4.559 billion. Layout, style, paint, and raster
task counts match. The raster worker pool uses 1.109 billion instructions in both flat runs and
7.926 → 7.853 billion in the wavy runs. The one-indicator comparisons also reduce renderer instructions.
Same-build renderer controls give 5.630 and 5.632 billion for flat, and 4.725 and 4.712 billion for wavy RTL.

The indeterminate segments animate their clip edges in CSS. In a Chromium trace of 60 flat indicators over
120 frames, the segments cause 106 style updates and no layouts. Moving them offscreen or setting an ancestor
to `visibility: hidden` removes raster work, but the style updates continue. An ancestor with `display: none`
cancels the animations; the browser starts them again on reveal.

Each segment uses one CSS animation for both clip edges. Each edge keeps its own keyframe offsets and easing.
Across four pairs of 120 native Chromium frames with 60 indicators, renderer instructions fell from 5.148 to
5.014 billion for flat and from 4.258 to 4.121 billion for wavy RTL. Same-build controls were 5.140/5.137 and
4.251/4.242 billion, respectively. Both variants kept 120 style updates and zero layouts. In a separate
offscreen flat comparison, median instructions fell from 4.564 to 4.428 billion with no raster tasks.

The fixed playback comparisons matched 648 Chromium frames, including authored fractional geometry,
direction changes, reveal, and reduced motion. Firefox and WebKitGTK matched all 386 sampled clip states
across two cycles, including immediately before and after the original keyframe offsets.

Applying `content-visibility: auto` to the viewport removes the offscreen style updates. Applied immediately,
it delays the start of an animation created offscreen. Enabling it after the animation starts preserves the
elapsed time, but the first frame after a scroll jump omits the active segments and the second still differs.
It also changes the containing block of a fixed-position active segment. These controls leave the shipped
styles unchanged. See [CSS Containment Level 2](https://drafts.csswg.org/css-contain-2/#restrictions).

Pausing offscreen animations with an IntersectionObserver and restoring their original start times also
removed measured offscreen style updates. The first scroll-jump frame still painted the paused phase,
before the observer restored the elapsed time. At one indicator the first frame differed by 2,452–2,454
flat pixels or 3,551–3,555 wavy RTL pixels; same-build differences were at most 15. A separate
`will-change: clip-path` probe matched 192 fixed frames but added no compositor layer and showed no
native rendering gain. Both changes remain out of the shipped styles and runtime.

Animating both clip edges as additive `clip-path` animations reduced visible flat style CPU from 1,416 to
414 ms over 120 Chromium frames with 60 indicators. Style still updated each frame. Six of 312 frame pairs
differed in wavy RTL startup or reveal across three device scales. Animating only the start edge also failed:
the composed clip did not pick up the concurrent animation of the custom property for the end edge.
Neither additive variant preserves the original frame output.

The published-package benchmark reproduces 80 style updates in 80 offscreen frames at 60 flat indicators,
and zero when the test defers viewport containment until after startup. It records the trace and the first
four frames after the scroll jump:

```sh
pnpm run build
pnpm exec playwright install chromium --only-shell
LINEAR_VISIBILITY=offscreen pnpm exec tsx benchmarks/progress-indicators/run.ts linear-indeterminate .tmp/progress-indicators/offscreen
LINEAR_VISIBILITY=offscreen LINEAR_DEFER_SKIP=1 pnpm exec tsx benchmarks/progress-indicators/run.ts linear-indeterminate .tmp/progress-indicators/deferred
```

Use `LINEAR_SHAPE=wavy` for the RTL wavy variant, or set `LINEAR_VISIBILITY` to `visible`, `visibility-hidden`,
or `display-none`. To capture the same 120 animation phases for the clip edge comparison, set
`LINEAR_PIN_PHASE=1` in the visible scenario. Run it against the current build and a build of `75b0005`
with this benchmark runner copied into that checkout. Set `HEADLESS_SHELL` to select an existing
Chromium Headless Shell binary.

## 8. Tab Indicator Geometry

TabList observes its list and current Tab elements while the line variant is active. It releases these resources in
the navigation variant, where CSS hides the indicator. A MutationObserver distinguishes between content and membership changes:

- character data changes queue an indicator measurement but do not rebuild observers;
- child-list changes incrementally observe new Tabs and unobserve removed Tabs, then queue measurement;
- active value and orientation changes only queue measurement.

The window resize listener is a fallback used only when ResizeObserver is unavailable. Indicator updates are coalesced
to one pending rAF without repeatedly cancelling and requesting another frame. The indicator has its own render effect,
so applying measured geometry does not rerender the trigger slot. It publishes new inline styles only when the
measured geometry or indicator opacity changes.

Selection measurements use the active marker published by each Tab. Custom triggers must bind the attributes
from `getTriggerAttrs()` so indicator measurement and selection use the same state.

Keep character-data observation. In fixed-width Tabs, label content can change the indicator width without changing
the outer Tab's observed size.

Each Tab's icon slot determines its trigger layout. The trigger publishes the slot's presence so label changes
can avoid invalidating trigger styles through a descendant selector.

## TreeView Indexing

The full index records node keys, sibling positions, and inherited disabled state once per data change.
The builder passes the resolved disabled state down each branch and visits children only when they are present.
The visible list and interaction methods reuse the same indexed keys. Dynamic data must use reactive nodes or
replace a reactive items source; untracked node mutations do not rebuild the index. Focus recovery reads the
previous index's keys and parents, so a reactive rename cannot erase the old node's position or ancestry.

Against `0a7672f`, six cold Chromium runs at 10,000 nodes reduce median index CPU from 21.5 to 15.9 ms
with reactive data and from 4.5 to 3.0 ms with plain data. Three virtualized expansion runs reduce visible
list calculation from 10.7 to 4.4 ms for reactive data; the separate same-build control measured 13.5 and
13.8 ms. Expanded and collapsed screenshots match, and both builds restore focus to the same ancestor when
a branch closes.

To compare the published package, run the same lifecycle fixture against both revisions. It keeps a
fixed window of 24 rendered rows while changing the visibility of 10,000 logical children:

```sh
pnpm run build
CHROME_PATH=/usr/bin/google-chrome pnpm exec tsx benchmarks/tree-view/run.ts reactive
CHROME_PATH=/usr/bin/google-chrome pnpm exec tsx benchmarks/tree-view/run.ts raw
```

Copy `benchmarks/tree-view/` into older comparison checkouts. Each run writes its Chromium traces and
`summary.json` under `.tmp/tree-view/lifecycle/`. Compare the renderer thread timestamps (`tts`) of the
lifecycle markers, alternating revisions and repeating one build as a control. Five alternating runs of
the reactive package fixture reduced median expansion CPU from 14.0 to 8.9 ms; the same-build control
measured 15.4 ms. Seven plain-data runs covering twelve expansion and collapse updates used 192.6 to
186.5 million renderer instructions; the same-build control used 194.0 million.

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

### Icon style allocation

The inline and standalone defaults share immutable style records. Icons with explicit size, weight or content ratio
still resolve their own styles. Vue caches that calculation across unrelated updates, such as a change to the glyph
name. Keeping the defaults as inline styles preserves the cascade and the precedence of consumer styles.

In five paired Chromium production traces against `4d08d4c`, 240 default icons perform 16 mount/unmount cycles and
24 glyph updates. Median renderer instructions fall from 2.537 to 2.495 billion. The first five-pair comparison
measured 2.515 to 2.490 billion, with a same-build control of 2.523 and 2.524 billion. The mounted JS heap increment
after forced collection falls from 1,081 to 1,030 KiB. The post-unmount heap increment is about 172 KiB on both
sides, including browser code warmed by the fixture. Both builds record 57 layouts and 205 raster tasks. The
singleton, changing-override, fixed-override and 240-Breadcrumb workloads show little change in whole-trace
instruction counts. A prototype that computed style in every render used more renderer instructions when 240 icons
kept explicit styles and only their glyphs changed, so the per-instance cache remains for this path.

Run the same mount, update and unmount sequence against a built package to collect raw Chrome traces, heap counters
and stage timings. Run each version with its own `dist/` and write to separate output directories.

```sh
pnpm run build
CHROME_PATH=/path/to/chrome pnpm exec tsx benchmarks/icon-styles/run.ts icon
```

The runner also accepts `breadcrumb`, `button`, `overrides`, and `static-overrides`. The optional second argument
sets the output directory (default: `.tmp/icon-styles/<variant>`).

### Divider root styles

Divider resolves its two optional inline tokens during render. Without overrides it returns no inline style; clearing
the props restores inherited tokens or CSS defaults. Consumer inline styles retain precedence. Browser tests check
rendered thickness and spacing in both orientations, including inherited tokens and changes to prop overrides.

The original production Chromium fixture against `e923ecc` ran 12 mount/unmount cycles, mounted again, and made 24 updates.
For 400 Dividers, the medians below compare baseline, candidate, and a second baseline run in rotated order.
Mounted JS heap is the increase over the warmed, unmounted page after forced garbage collection.

| Props                              |        Mounted heap (KiB) | Renderer instructions (millions) |
| ---------------------------------- | ------------------------: | -------------------------------: |
| Default thickness and spacing      | 1,069.8 / 984.0 / 1,069.8 |      1,477.7 / 1,484.3 / 1,484.0 |
| Fixed custom thickness and spacing | 1,056.2 / 970.2 / 1,056.0 |      1,372.2 / 1,370.6 / 1,375.2 |
| Changing thickness and spacing     | 1,071.7 / 983.9 / 1,071.7 |      2,020.0 / 1,980.6 / 2,018.6 |

Layout and style event counts match for both mount and update in each case. After unmount, the node count returns to
the warmed baseline. Five visual comparisons of five states each match pixels, geometry, root attributes, and
computed styles. They cover removing custom tokens, CSS inheritance, consumer inline styles, orientation and insets,
and light and dark themes. The local trace runner and reproduction commands are in
`.tmp/interaction-layout-audit/production/README.txt`.

The published-package fixture confirms the mounted heap reduction at 400 Dividers: 1,099 to 1,019 KiB for default
props and 1,112 to 1,040 KiB with changing overrides. Both revisions return to the same node count after unmount.
Run against each revision's own `dist/` and use separate output paths. Copy `benchmarks/divider/` into the baseline
checkout if it predates the fixture. Set `CHROME_PATH` to use the same installed Chromium for both.

```sh
pnpm run build
pnpm exec tsx benchmarks/divider/run.ts default .tmp/divider/current-default
pnpm exec tsx benchmarks/divider/run.ts custom .tmp/divider/current-custom
```

### Badge accessibility attributes

Badge renders `aria-hidden` from the hidden prop and the accessible label it already reads. A separate computed
value for that attribute added state to each Badge without caching any new work.

Against `ad84406`, five paired Chromium production traces with 320 Badges inside line Tabs reduce the mounted
JS heap increment from 3,955 to 3,859 KiB. Renderer instructions are 4,020 and 4,018 million, with 58 layouts
and 125 raster tasks in both builds. Moving numeric maximum normalization into the content calculation also
saved heap, but its separate control increased renderer instructions, so it remains cached.

The published-package trace also reduces mounted heap by about 105 KiB at 320 instances.

Collect the same mount, update and unmount sequence against the built package with:

```sh
pnpm run build
CHROME_PATH=/path/to/chrome pnpm exec tsx benchmarks/badge/run.ts tabs .tmp/badge/tabs/current
```

Use `standalone` instead of `tabs` to measure Badge without the surrounding Tab triggers and indicator.

### InputOtp cell values

InputOtp projects the model into one dense array of cell values. Rendering and editing use that array directly,
including the empty cells after the last accepted character. Changing the length still truncates an oversized
model using the same numeric and Unicode rules; form submission still uses the model.

In five fixed-frame Chromium comparisons against `eee41aa`, 60 empty six-cell groups retain 3,584.0 KiB of
JavaScript heap before the change and 3,550.6 KiB after it. The same-build control retains 3,584.0 KiB.
Twenty-four model updates across those 60 groups take 1,745.0 → 1,737.4 million renderer instructions, with
the same 24 style updates, 24 layouts and 48 paints. The same-build control takes 1,744.8 million.
Native typing stays within the spread of same-build samples, including the 128-cell stress case. All 78 fixed
frames match in pixels, values, focus and selection across the typing, paste, deletion and reveal sequence.

The published-package fixture records heap and browser traces for one and 60 six-cell groups. At 60 groups,
mounted heap growth above the warmed page falls from 1,335.9 to 1,300.5 KiB. In a separate same-session
comparison, both builds release all 480 sampled roots and inputs on unmount, and their DOM and listener
counts return to their pre-mount levels.

```sh
pnpm run build
pnpm exec tsx benchmarks/input-otp/run.ts .tmp/input-otp/lifecycle/current
```

For the baseline, copy `benchmarks/input-otp/` into a checkout of `eee41aa` and use a separate output directory.
Set `CHROME_PATH` to use the same Chromium binary for both runs.

### Selection item input attributes

Chip and ButtonGroupItem read native input type, name and value during render. The selection item still caches its
value for membership checks, its selected state for update isolation, and its disabled state for both rendering and
press handling. The group still owns the model. The two initial variants also removed the value cache; at 1,200
Chips, each added about nine million renderer instructions across six fixed-frame activations. Retaining the cache
keeps the membership path stable.

In the final five-pair Chromium comparison against `0978f33`, 1,200 Chips use 2,483.7 to 2,482.8 million
renderer instructions for six activations. Both record 12 layouts, 84 style updates and 261 paints. The same
single-Chip workload uses 309.0 to 309.1 million instructions. In five rotated lifecycle rounds at 320 Chips,
the mounted JS heap increase after garbage collection is 4,814.8 to 4,608.5 KiB (same-build control: 4,820.9 KiB).
Both builds return to 20 DOM nodes after unmount. The published package confirms the mounted heap reduction:
4,179.8 to 3,907.1 KiB at 320 Chips and 4,672.3 to 4,486.0 KiB at 320 ButtonGroupItems. Both package workloads
return to the warmed node count after unmount. The published stylesheet is byte-identical.

The 84 Chip frames, 76 connected ButtonGroup frames and 15 form states match. The form comparison changes
group mode, input type, name, value and disabled state; it also checks local selection outside a group.

To compare package lifecycle traces, use the same Chromium and each revision's own `dist/`. Copy
`benchmarks/selection-items/` into the baseline checkout if needed.

```sh
pnpm run build
pnpm exec tsx benchmarks/selection-items/run.ts chip .tmp/selection-items/current-chip
pnpm exec tsx benchmarks/selection-items/run.ts button .tmp/selection-items/current-button
```

### Menu item selection

Each model-bound MenuItem checks membership once and uses the result for its slot state, selected styling and ARIA
attributes. Items without a selection binding still use the independent `checked` and `selected` props.

An instrumented production fixture with half of the choices selected records 192 → 96 lookups at eight items
and 7,680 → 3,840 at 320 items over 12 toggles, whether triggered by Enter or a model replacement. The table
shows median renderer instructions in millions over 24 toggles in five uninstrumented Chromium runs per build:

| Items | Trigger           | Baseline (`33e3e01`) | Current | Same-build control |
| ----: | ----------------- | -------------------: | ------: | -----------------: |
|     8 | Enter             |               166.89 |  163.59 |             167.00 |
|     8 | Model replacement |                89.06 |   85.47 |              88.88 |
|   320 | Enter             |               488.96 |  391.07 |             489.51 |
|   320 | Model replacement |               401.34 |  309.08 |             400.82 |

For a given trigger and item count, the number of style, layout, paint and raster events is the same across all
builds. All 72 matched screenshots and state samples agree across entry, selection, exit, interrupted exit
and reopen at both menu sizes. Free-running browser timings vary with frame scheduling and do not establish
a consistent elapsed-time reduction.

The published-package benchmark records mount, update and unmount traces and heap usage for the same menu sizes.
At 320 items, median mounted heap growth above the warmed page falls from 3,669 to 3,500 KiB. DOM node and
listener counts return to the warmed levels after unmount in both builds.

```sh
pnpm run build
CHROME_PATH=/path/to/chrome pnpm exec tsx benchmarks/menu-selection/run.ts .tmp/menu-selection/lifecycle/current
```

For the baseline, copy `benchmarks/menu-selection/` into a checkout of `33e3e01`, build it and use a separate
output directory with the same Chromium binary.

### Select local filtering

Large local searches apply native locale-sensitive lowercasing to bounded groups of option text. NUL separates
the case-mapping contexts, including Greek final sigma and locale-sensitive combining marks. Text containing
NUL or exceeding the per-label bound still converts on its own. Results keep source order and indices, and
the temporary text is released after each query.

In five paired Chromium runs against `937f101`, typing `Option 123` into a virtualized Select with 10,000
reactive options reduced median main-renderer instructions from 2.750 to 1.247 billion (same-build control:
2.748 billion). Renderer task CPU went from 543.3 to 517.0 ms (control: 570.3 ms). Layout, style, paint and
raster event counts remained 34, 36, 23 and 22; instruction samples inside the layout, style and paint events
were comparable. Post-GC page heap measured 8,487.9 to 8,501.6 KiB (control: 8,488.2 KiB).
The 4- and 200-option controls showed no consistent instruction change. All 58 fixed frames matched
across the 200-option ordinary and 10,000-option virtual lists, including interrupted filtering and reopening.

Single-value display resolution scans for the value directly and reads the label directly when there is one
result. String and finite numeric identifiers use value equality; string and number identifiers remain distinct.
Missing values use the label resolver, without coercing the identifier. In 24 updates
to a closed Select with 10,000 plain options, median renderer instructions fell from 78.67 to 67.62 million
(same-build control: 91.06 million). With a reactive array they measured 648.20 to 643.78 million
(control: 647.15 million), which does not establish a consistent change. The settled pixels matched.

### Combobox attribute forwarding

Combobox caches a snapshot of its declared props. Vue forwards consumer attributes and native listeners through
the single Select root. Including attrs in the snapshot made attribute changes rebuild the prop object before Vue
forwarded the same attributes again.

In five paired Chromium production traces against `ae4029b`, 120 Comboboxes perform eight mount/unmount cycles
and sixteen attribute-only updates. Renderer instructions fall from 16.339 to 15.963 billion, with 17 layouts
and 144 raster tasks on both sides. After forced collection, the mounted JS heap increment falls from 19,229
to 19,138 KiB. With mixed prop and attribute updates, the instruction medians are 17.109 and 17.002 billion.
The dense workload without consumer attributes remains near baseline for both instructions and heap.

Binding the reactive props object directly was faster in some traces, but heap snapshots showed an additional
800-byte property backing store per mounted Combobox. This cost remained with JIT disabled. Keeping the prop
snapshot avoids that cost while allowing attribute-only updates to reuse the snapshot.

The published-package fixture reproduces an 83 KiB mounted heap reduction at 120 instances. At one instance,
the warmed page uses about 10 KiB more JS heap. The singleton heap diagnostic attributes the increase to V8
code; it does not show growth in retained component objects or arrays.

To collect the attribute update trace against the published package, build each version and give it a separate
output directory:

```sh
pnpm run build
CHROME_PATH=/path/to/chrome pnpm exec tsx benchmarks/combobox-forwarding/run.ts .tmp/combobox-forwarding/current
```

### Default locale context

A component without a locale provider needs two computed values: an undefined formatting locale for native locale
negotiation, and the English message catalog. The fallback creates those values per consumer. The configurable
context still owns locale inheritance, reactive language changes and message overrides.

Against `e0924e6`, five paired Chromium traces with 120 directly imported Comboboxes reduce the mounted JS heap
increment from 18,366 to 18,306 KiB. The 33 layouts and 400 raster tasks match, and post-unmount heap remains about
419 KiB. Repeated traces do not establish a renderer instruction improvement. A control with a configured provider
shows no change to component heap allocations in the jitless comparison.

The package benchmark from the Combobox forwarding section also exercises this fallback. Across five rounds at
120 instances, its mounted heap increment falls from 18,947 to 18,882 KiB. Use separate output directories when
comparing builds.

### Published styles

Removing 283 unreferenced private custom property declarations across 11 component stylesheets reduced the published
`style.css` from 771,946 to 721,860 bytes. Gzip reduced from 74,723 to 71,523 bytes and Brotli from 51,807 to 49,828 bytes.
The production CSS comparison matched every remaining rule and declaration in order, including the public tokens.

Button variant and size rules resolve their public token fallbacks where each value is used. This removes 94
private declarations from the rule that matches every Button. The published sheet decreases further to 712,525 bytes
(70,835 gzip, 49,393 Brotli). Across five fixed-frame mount and unmount rounds with 160 three-button groups, the
median renderer instruction count was 2.731 billion before and 2.620 billion after, compared with 2.737 and 2.728
billion in the same-build control. The counts of style, layout, paint and raster tasks were the same.

Resolving IconButton's 97 private token fallbacks in the matching variant and size rules reduces the published sheet
to 703,190 bytes (70,194 gzip, 48,908 Brotli). Five fixed-frame mount and unmount rounds with 320 mixed IconButtons
take 1.898 billion renderer instructions before and 1.787 billion after. The same-build control measures 1.875
and 1.886 billion. Both builds have the same style, layout, paint and raster task counts.

Chip and ButtonGroup also resolve variant and size fallbacks in the rules that consume them. Across four paired runs
of six selections in a 1,200-Chip group, the renderer instruction count falls from 2.526 to 2.421 billion while
raster workers stay at about 215 million. The same-build control measures 2.527 and 2.526 billion on the renderer.
Style, layout, paint and raster task counts match in the paired runs. ButtonGroup's mount difference falls within the
same-build variation. The two changes bring the published stylesheet to 679,113 bytes (68,466 gzip, 47,748 Brotli).

Menu, Tabs, Card and Tooltip resolve another 58 private aliases in the rules that consume their public tokens.
Eleven shared aliases remain in their matching Menu or Tabs variant. Compared with `17c87ca`, the published sheet
falls from 679,232 to 671,816 bytes, gzip from 68,517 to 67,821 bytes, and Brotli from 47,797 to 47,549 bytes.
Public token placeholders are unchanged. Fixed-frame Menu mounts and Tabs presses do not establish a CPU improvement
above the same-build variation; the verified saving is the stylesheet size. Chromium pixels and standard computed
styles match across Card shapes and interactive variants, Menu selection and disabled states, and inherited public
token overrides. The Card and Menu matrices also match in Firefox. Tabs keyboard motion and both Tooltip variants
match their animation frames with authored typography, colors and shapes.

TextField resolves 18 private aliases in the disabled and error rules that use them. TextField, Select and
Combobox continue to use the same public field tokens. Compared with `b413e5b`, this step reduces the published
stylesheet from 671,816 to 667,548 bytes (67,833 to 67,278 gzip). Five fixed-frame runs per build, with three
and 240 fields, do not establish a renderer CPU improvement during input, error, disabled or theme updates.
All 72 Chromium pixel and state pairs and 31 Firefox state pairs match, including public color and opacity
overrides and Select reopening during exit.

Select imports the TextField component, which already loads its own stylesheet. Removing Select's redundant
CSS import removes one adjacent, byte-identical copy of the TextField layers from the published stylesheet.
The resulting file is 634,924 bytes (64,684 gzip and 47,391 Brotli). All other rules stay in their original
order. Vite consumers importing TextField, Select or Combobox emit the same JavaScript and omit only a
redundant forced-colors rule from the compressed stylesheet. The raw published styles match all 72 sampled
frames and states in normal colors and all 72 in forced-colors mode.

DatePicker and DateRangePicker load one stylesheet for their shared calendar presentation. The Tooltip
component uses the same stylesheet import as the directive, and ListItem, NavigationDrawerItem and
NavigationRailItem import the shared glyph styles directly. Compared with `f27c891`, the published stylesheet
goes from 634,924 to 597,486 bytes, from 64,684 to 63,104 gzip bytes, and from 47,391 to 47,294 Brotli bytes.
The package removes only exact rule copies and preserves the remaining rules in order. The minified
interaction fixture emits identical JavaScript.

Separate source imports preserve both calendar variants, component and directive tooltips, and glyph
styles. Fixed-frame comparisons match 183 calendar pairs, 150 tooltip pairs and 62 list and navigation
pairs. They include authored tokens, interrupted exits and reopens, native pointer and keyboard input,
and both Latin and CJK language settings.

Run the same commands at the baseline revision `b6043d8` and at the change under test, using a fresh output directory
for each build. Revision `480b63a` is the baseline for Button, `f6eae5f` for IconButton, and `cef2bbb` for Chip and
ButtonGroup. Use `b413e5b` for the TextField and Select stylesheet changes and `f27c891` for the calendar, tooltip
and glyph stylesheet changes.

```sh
output_dir="$(mktemp -d)"
pnpm exec vite build --outDir "$output_dir"
node -e 'const b = require("node:fs").readFileSync(process.argv[1]); const z = require("node:zlib"); console.log(b.length, z.gzipSync(b).length, z.brotliCompressSync(b).length)' "$output_dir/style.css"
```

## DateRangePicker Range Background

The original day cell used one background box for both a whole day and half of an endpoint. Each change between
those states resized an absolutely positioned box. The day cell now has separate boxes for the whole day and the
endpoint. The endpoint keeps its original logical insets, so gradients and authored cell backgrounds paint in the
same place in either inline direction. The boxes require no extra DOM elements.

In five fixed-frame Chromium pairs, twelve range selections took 579.1 million renderer instructions before the
change and 381.1 million after it. The same-build control took 579.2 and 579.1 million. Both builds performed
12 style updates, 12 layouts, 24 paints and 73 raster tasks. Raster workers took 64.5 and 64.1 million instructions.
The 24-closed-picker test had the same DOM node and listener counts, and tracked nodes were released on unmount.
With pointer events and ripples included, median layout CPU fell from 337.3 to 298.5 ms and renderer task CPU
from 958.8 to 915.2 ms across five pairs. All 189 fixed Chromium frames match in pixels and state, including
RTL, vertical writing, authored backgrounds, same-day ranges, disabled dates and interrupted reopen.
Firefox matches the day and background geometry, gradients and selection in 12 corresponding states.

The published package benchmark measures the same selection sequence without mouse hover or ripple. Across five
rounds per build on the same cores, median layout CPU fell from 117.6 to 68.2 ms, and median renderer task CPU from
190.9 to 143.9 ms. Use Chromium Headless Shell to advance exactly two frames per activation. The runner writes five
Chrome traces and prints the stage counts and CPU times.

```sh
pnpm run build
pnpm exec playwright install chromium --only-shell
pnpm exec tsx benchmarks/date-range-picker/run.ts .tmp/date-range-picker/current
```

For a baseline, run the same fixture against a package built from `7fb7ed1`, copying
`benchmarks/date-range-picker/` into that checkout and writing to a different output directory. Set
`HEADLESS_SHELL` to use an existing Chromium Headless Shell binary.

## DateRangePicker Day Labels

The range picker already projects the selected endpoints onto its day cells. Unselected cells use the cached
localized date directly. Selected cells still call the label formatter for the localized start, end, or combined
endpoint message, and the public composable keeps its existing label API.

In the production Chromium fixture, 12 model updates to 24 closed range pickers call the endpoint label helper
576 times, down from 24,192. Both builds resolve 576 endpoint messages. In five separate, rotated, uninstrumented
rounds against `dc09838`, median renderer instructions are 702.4 to 690.0 million, with a same-build control of
700.3 million. Layout, style recalculation, paint, and raster counts are zero throughout this measured window.
The 12 fixed-frame selections at one visible picker measure 379.1 to 378.3 million instructions (control 379.1
million), with equal counts in those rendering phases.

All 126 fixed range frames match across default and authored backgrounds, different device scales, RTL,
locale and week-start changes, same-day and boundary ranges, keyboard focus, and interrupted exit.
The local trace runners and commands are in `.tmp/interaction-layout-audit/production/README.txt`.

To trace closed model updates against the published package, run the following with each revision's own `dist/`.
Copy the fixture to the baseline checkout if it predates the model workload.

```sh
pnpm run build
pnpm exec tsx benchmarks/date-range-picker/run.ts .tmp/date-range-picker/closed-model model
```

A separate candidate caches the localized numbers 1 through 31 for reuse across month grids. It matches all
120 fixed date and range frames but leaves renderer instruction counts within the same-build variation in
both month changes and repeated mounts. That cache stays isolated.

## Calendar Day Bounds

DatePicker and DateRangePicker normalize each bound once per reactive input change. Month grids capture those
validated values, and imperative checks, navigation, and month/year choices use the same normalized bounds.
Dynamic bounds must be refs or getters that read reactive state; untracked getter mutations do not update the
cached bounds. Invalid dates are treated as absent bounds.

For the original bound-read optimization, five rotated Chromium rounds with four mount/unmount cycles of 24
closed DatePickers took 1,074.7 to 1,061.2 million renderer instructions, with a same-build control of 1,081.5
million. DateRangePicker took 2,062.0 to 2,003.6 million, with a control of 2,062.6 million. The measured windows
had no style, layout, paint, or raster work. The local trace runners and commands are in
`.tmp/interaction-layout-audit/production/README.txt`.

## Tabs Indicator Measurement

Line TabList reads the active trigger's geometry in its scheduled animation-frame callback. Moving this read after
layout changes the sampled target when an authored callback writes positions later in the frame. Removing the
synchronous layout count is therefore insufficient evidence of an equivalent optimization.

With 320 labels gaining or losing a text marker in each of 24 consecutive frames, omitting indicator measurement reduces
the layout count from 25 to 24, but median layout CPU only changes from 132.6 to 130.0 ms. The text width changes
still require layout. A separate six-selection trace, advancing the indicator's width transition through 16 frames
per selection, has 96 layouts. Layout containment on the list or an additional fixed-size wrapper retains those
96 layouts and increases renderer instructions. These controls leave the existing measurement phase and DOM intact.

With 320 real Badges alternating between `8` and `99+` over 24 frames, the current TabList performs 48 layouts.
Suppressing the geometry read leaves 24 layouts and no synchronous layouts. Keeping the read but withholding
the indicator style update also leaves 24 layouts, all synchronous. The Badge widths account for the first layout;
changing the indicator's own width accounts for the second. Withholding that update changes the displayed
indicator. Applying layout containment, with or without size containment, to the indicator itself retains
48 layouts and leaves renderer instructions within the same-build variation.

A rounded clip over a constant-size indicator removed the 24 indicator layouts, but extended the scrollable
width by 16 px on the three-Tab fixture and changed the indicator's pixels. At 320 Tabs it increased median
renderer instructions from 2.812 to 3.447 billion (same-build control: 2.811 billion) and paint CPU from
27.4 to 116.1 ms. Removing the permanent `will-change` hint instead removed 80 drawing layers across 80
line TabLists, but changed edge pixels during interrupted transitions at 1.25× device scale. A reduced-motion
test with a narrow tab and custom indicator corners also differed. Keep the real indicator box and the hint
until a replacement preserves scroll geometry and rendering.

The published package reproduces 48 layouts and 24 synchronous layouts at both three and 320 Tabs. At 320,
median layout CPU is 190.8 ms, of which 186.4 ms occurs inside script. This benchmark gives TabList the first
geometry read of each update and writes raw traces and stage counts:

```sh
pnpm run build
pnpm exec playwright install chromium --only-shell
pnpm exec tsx benchmarks/badge/layout.ts .tmp/badge/layout/current
```

Set `HEADLESS_SHELL` to use an existing Chromium Headless Shell binary.

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
