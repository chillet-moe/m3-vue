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
  const ariaDisabledMode = options.ariaDisabledMode ?? 'anchor';
  const disabledTabIndexMode = options.disabledTabIndexMode ?? ariaDisabledMode;

  return computed(() => {
    const disabled = toValue(options.disabled) ?? false;
    const sourceHref = toValue(options.href) || undefined;
    const tag = sourceHref ? 'a' : toValue(options.defaultTag);
    const isButton = tag === 'button';

    return {
      tag,
      nativeDisabled: isButton ? disabled : undefined,
      ariaDisabled: disabled && matchesDisabledMode(tag, ariaDisabledMode) ? 'true' : undefined,
      href: disabled && tag === 'a' ? undefined : sourceHref,
      tabIndex: disabled && matchesDisabledMode(tag, disabledTabIndexMode) ? -1 : undefined,
      type: isButton ? 'button' : undefined,
    } as const;
  });
}
