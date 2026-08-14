---
title: List Grouping
---

<script setup lang="ts">
import ListGroupingDefault from '../demos/list-grouping/ListGroupingDefault.vue';
import ListGroupingDefaultSrc from '../demos/list-grouping/ListGroupingDefault.vue?raw';
import ListGroupingParticipants from '../demos/list-grouping/ListGroupingParticipants.vue';
import ListGroupingParticipantsSrc from '../demos/list-grouping/ListGroupingParticipants.vue?raw';
import ListGroupingBoundaries from '../demos/list-grouping/ListGroupingBoundaries.vue';
import ListGroupingBoundariesSrc from '../demos/list-grouping/ListGroupingBoundaries.vue?raw';
import ListGroupingShapes from '../demos/list-grouping/ListGroupingShapes.vue';
import ListGroupingShapesSrc from '../demos/list-grouping/ListGroupingShapes.vue?raw';
</script>

# List Grouping

List grouping is a CSS utility for applying connected corner shapes to related direct children. It does not render a
wrapper or impose layout, spacing, ARIA roles, or list semantics.

Add `data-scope="list" data-part="container"` to the container. Direct children opt in with `data-list-group-item` and
declare a `data-shape` of `rounded` or `square`:

```vue
<section class="settings-list" data-scope="list" data-part="container">
  <ListItem title="Account" />
  <StatusRow data-list-group-item data-shape="rounded" />
  <article data-list-group-item data-shape="rounded">Last synced just now</article>
</section>
```

`ListItem` automatically carries the participant marker and its `shape` prop supplies `data-shape`. Other elements and
components must provide both attributes explicitly.

## Behavior

With the default tokens, rounded middle participants use an `8px` radius and the first and last rounded participants
use `24px` outer corners. Square middle participants use `4px`; square first and last participants use `4px` on their
inner corners and retain their own outer shape.

Only marked direct children participate. Headings, dividers, and other unmarked children do not affect first or last
matching. Nested grouping containers form independent groups. The utility styles only participant roots, so custom
components remain responsible for their internal surfaces and clipping.

When a container or participant marker is placed on a Vue component, its root must receive fallthrough attributes. A
single-root component does this by default; components using `inheritAttrs: false` should forward `$attrs` to the
intended root.

`ListItem` additionally adapts its active indicator to the resolved group shape.

## Examples

### Rounded and square

The same container contract supports rounded and square participants, including mixed custom roots.

<DemoContainer :src="ListGroupingDefaultSrc"><ListGroupingDefault /></DemoContainer>

### Passive and custom participants

Interactive behavior is independent from grouping. Passive `ListItem` roots and user-owned elements participate using
the same shape contract.

<DemoContainer :src="ListGroupingParticipantsSrc"><ListGroupingParticipants /></DemoContainer>

### Non-participants and nested groups

Unmarked direct children are ignored, while a nested container calculates its own first and last participants.

<DemoContainer :src="ListGroupingBoundariesSrc"><ListGroupingBoundaries /></DemoContainer>

### Custom shapes

Set the grouping tokens on each container to tune its middle and outer corners without targeting participant internals.

<DemoContainer :src="ListGroupingShapesSrc"><ListGroupingShapes /></DemoContainer>

## Styling

Set the following tokens on the grouping container.

<StyleTokenTable component="ListGrouping" />
