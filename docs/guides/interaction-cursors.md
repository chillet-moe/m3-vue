---
title: Interaction Cursors
---

<script setup lang="ts">
import InteractionCursors from '../demos/guides/InteractionCursors.vue';
import InteractionCursorsSrc from '../demos/guides/InteractionCursors.vue?raw';
</script>

# Interaction Cursors

M3 Vue exposes cursor policy as inherited semantic CSS tokens. Set the policy once instead of overriding component
classes or internal elements.

| Token                | Default   | Applies to                                                                                                                                                |
| -------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--md-cursor-action` | `pointer` | Actions that run in the current interface, including buttons, cards, selection controls, menus, navigation controls, tabs, pickers, selects, and sliders. |
| `--md-cursor-link`   | `pointer` | M3 Vue components that render a real link with an active `href`.                                                                                          |

To use the default arrow for ordinary controls while retaining the hand for navigation to a URL:

```css
:root {
  --md-cursor-action: default;
  --md-cursor-link: pointer;
}
```

The defaults are both `pointer`, so existing applications keep their current behavior. Keeping separate tokens lets an
application adopt desktop-style action cursors without making links visually indistinguishable from actions.

## Scope and inheritance

The tokens are ordinary inherited custom properties. A `:root` override reaches the whole document, components
rendered in the native top layer, and component styles inside a shadow tree through its host. A local override can
change one component or DOM subtree.

Teleport follows the rendered DOM tree, not the Vue component tree. Put a policy needed by teleported menus or
pickers on `:root`, or on the actual overlay host that contains them; a custom property set only on the logical Vue
parent does not cross a Teleport boundary.

Actual links are detected from their active `href`. Disabled link components remove `href` and retain their disabled
cursor behavior.

## Exceptions

These tokens only replace the cursor of ordinary actions and links. They do not apply a global selector and do not
change semantic cursors such as text insertion, help, crosshair, grab/grabbing, resize, move, or not-allowed. Disabled,
read-only, and presentation-only component states also keep their explicit `default` or inherited cursor behavior.

<DemoContainer :src="InteractionCursorsSrc" :viewport="false">
  <InteractionCursors />
</DemoContainer>
