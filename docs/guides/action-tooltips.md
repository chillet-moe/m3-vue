---
title: Action Tooltips
---

# Action Tooltips

Action components use `title` as the simple text tooltip entry point. The title is rendered with the library tooltip behavior and is not forwarded to the DOM, so native HTML tooltips do not appear.

```vue
<Button title="Save changes">Save</Button>

<IconButton icon="settings" title="Settings" />

<FloatingActionButton icon="edit" title="Compose" />
```

This behavior is available on:

- `Button`
- `IconButton`
- `FloatingActionButton`

For icon-only actions, `title` is also used as the fallback accessible name when neither `aria-label` nor `aria-labelledby` is provided.

```vue
<IconButton icon="settings" title="Settings" />

<!-- Equivalent accessible name, but keeps a different tooltip string. -->
<IconButton icon="settings" aria-label="Open settings" title="Settings" />
```

Use `v-tooltip` when you need rich content, a referenced tooltip surface, custom placement, or different interaction options.

```vue
<Button v-tooltip="'#save-tip'">Save</Button>

<Tooltip id="save-tip" variant="rich">
  Save the current draft and keep editing.
</Tooltip>
```

See [v-tooltip](/directives/tooltip) for the full directive API.
