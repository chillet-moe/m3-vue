import { computed, ref, watch, type Ref } from 'vue';
import { formatHex, parseHex, type ColorPickerValue } from './color';

export function useHexInput(value: Ref<ColorPickerValue>, alpha: () => boolean, locked: () => boolean) {
  const formatted = computed(() => formatHex(value.value, alpha()));
  const draft = ref<string>();
  const text = computed({
    get: () => draft.value ?? formatted.value,
    set: (next: string) => {
      draft.value = next;
    },
  });

  watch(
    [value, alpha, locked],
    () => {
      draft.value = undefined;
    },
    { deep: true },
  );

  function commit() {
    if (draft.value === undefined) return;
    const parsed = parseHex(draft.value);
    draft.value = undefined;
    if (parsed && !locked()) value.value = { ...parsed, a: alpha() ? (parsed.a ?? value.value.a) : value.value.a };
  }

  function keydown(event: KeyboardEvent) {
    if (event.isComposing || event.defaultPrevented || draft.value === undefined) return;
    if (event.key === 'Enter') {
      commit();
    } else if (event.key === 'Escape') {
      draft.value = undefined;
      event.stopPropagation();
    } else {
      return;
    }
    event.preventDefault();
  }

  return { text, formatted, commit, keydown };
}
