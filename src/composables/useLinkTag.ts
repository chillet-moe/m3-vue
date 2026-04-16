import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

export type LinkTag = 'a' | 'button' | 'label' | 'div';
export type DisabledStateMode = 'anchor' | 'non-button';

export type UseLinkTagOptions<TTag extends string = LinkTag> = {
  /** Base tag to render when no href is provided. */
  defaultTag: MaybeRefOrGetter<TTag>;

  /** Optional href. When present, the element renders as an anchor. */
  href?: MaybeRefOrGetter<string | undefined>;

  /** Disabled state used to mirror native button semantics for non-button tags. */
  disabled?: MaybeRefOrGetter<boolean | undefined>;

  /** Which rendered tags should receive aria-disabled when disabled. */
  ariaDisabledMode?: DisabledStateMode;

  /** Which rendered tags should be removed from the tab order when disabled. */
  disabledTabIndexMode?: DisabledStateMode;
};

function matchesDisabledMode(tag: string, mode: DisabledStateMode) {
  if (mode === 'anchor') {
    return tag === 'a';
  }

  return tag !== 'button';
}

export function useLinkTag<TTag extends string = LinkTag>(options: UseLinkTagOptions<TTag>) {
  const disabled = computed(() => toValue(options.disabled) ?? false);
  const sourceHref = computed(() => toValue(options.href));
  const ariaDisabledMode = options.ariaDisabledMode ?? 'anchor';
  const disabledTabIndexMode = options.disabledTabIndexMode ?? ariaDisabledMode;

  const tag = computed(() => {
    if (sourceHref.value) {
      return 'a' as const;
    }

    return toValue(options.defaultTag);
  });

  const isAnchorTag = computed(() => tag.value === 'a');
  const isButtonTag = computed(() => tag.value === 'button');

  const nativeDisabled = computed(() => {
    return isButtonTag.value ? disabled.value : undefined;
  });

  const ariaDisabled = computed(() => {
    if (!disabled.value || !matchesDisabledMode(tag.value, ariaDisabledMode)) {
      return undefined;
    }

    return 'true';
  });

  const href = computed(() => {
    if (!sourceHref.value) {
      return undefined;
    }

    return disabled.value && isAnchorTag.value ? undefined : sourceHref.value;
  });

  const tabIndex = computed(() => {
    if (!disabled.value || !matchesDisabledMode(tag.value, disabledTabIndexMode)) {
      return undefined;
    }

    return -1;
  });

  const type = computed(() => {
    return isButtonTag.value ? 'button' : undefined;
  });

  return {
    tag,
    isAnchorTag,
    isButtonTag,
    nativeDisabled,
    ariaDisabled,
    href,
    tabIndex,
    type,
  };
}
