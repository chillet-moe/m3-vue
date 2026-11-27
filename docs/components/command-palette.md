---
title: CommandPalette
---

<script setup lang="ts">
import { ref } from 'vue';
import CommandPaletteDemo from '../demos/command-palette/CommandPaletteDemo.vue';
import demoSource from '../demos/command-palette/CommandPaletteDemo.vue?raw';

const props = ref({ label: 'Editor commands', size: undefined, shape: undefined });
</script>

# CommandPalette

Use a command palette to find and run actions available in the current context. Open the example and search for `save`, or enter `prefs` to find a command by keyword.

<DemoContainer :src="demoSource" :viewport="false">
  <CommandPaletteDemo v-bind="props" />
</DemoContainer>

## Supply commands

Pass an array of `CommandPaletteCommand` objects to `commands`. Give each command a unique, stable string `id` and a display `name`. Use `group` for a category or path that distinguishes commands with the same name. Optional fields include `keywords` (a string array), `icon` (a Material Symbol name), `shortcut` (display text), and `disabled`. Update the array when the available actions change.

Bind `v-model:open` to control the palette. Register opening shortcuts such as F3 or ⌘K in the application scope where they apply. Handle `@select` to run the chosen command. It receives the command object once, after the native palette has closed, so the handler can focus a field or open another dialog.

## Search and navigation

Each opening focuses an empty search box and shows commands in source order. Matching ignores case and accepts letters in sequence. Exact names and name prefixes rank first. Changing the query activates the first enabled result. A context update preserves the active command by ID if it is still available.

Use ↑ and ↓ to move through enabled results while continuing to type. Press Enter or click a result to execute it. Escape and backdrop clicks dismiss the palette and return focus to its opener. During IME composition, navigation and confirmation keys remain available for candidate selection.

Result rows inherit the shared `rowSize` preference. Override it for one palette with `size`. The panel inherits the shared `shape` preference. See the [styling guide](../guides/styling).

## Reference

<AnatomyTable scope="command-palette" />

<ApiTable component="CommandPalette" v-model="props" :exclude="['commands', 'open']" />
