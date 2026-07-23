import { computed, type Ref } from 'vue';
import { useLinkTag } from './useLinkTag';

export type NavigationItemContext = {
  value: Readonly<Ref<string | undefined>>;
  disabled: Readonly<Ref<boolean>>;
  activate: (value: string) => void;
};

export type UseNavigationItemOptions = {
  context: NavigationItemContext | null;
  value: () => string | undefined;
  href: () => string | undefined;
  disabled: () => boolean;
  selected: () => boolean | undefined;
};

export function useNavigationItem({ context, value, href, disabled, selected }: UseNavigationItemOptions) {
  const mergedDisabled = computed(() => disabled() || context?.disabled.value || false);

  const selectedFromContext = computed(() => {
    const itemValue = value();

    if (!context || itemValue === undefined) {
      return false;
    }

    return context.value.value === itemValue;
  });

  const isSelected = computed(() => {
    const explicitSelected = selected();
    return explicitSelected === undefined ? selectedFromContext.value : explicitSelected;
  });

  const {
    tag,
    isAnchorTag,
    nativeDisabled,
    ariaDisabled,
    href: resolvedHref,
    tabIndex,
    type,
  } = useLinkTag({
    defaultTag: 'button',
    href: computed(href),
    disabled: mergedDisabled,
    ariaDisabledMode: 'non-button',
  });

  const guardDisabledInteraction = (event: Event) => {
    if (!mergedDisabled.value) {
      return false;
    }

    event.preventDefault();
    event.stopPropagation();
    return true;
  };

  const activate = () => {
    const itemValue = value();

    if (!context || itemValue === undefined) {
      return;
    }

    context.activate(itemValue);
  };

  const handleClick = (event: MouseEvent) => {
    if (guardDisabledInteraction(event)) {
      return;
    }

    activate();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (guardDisabledInteraction(event) || event.key !== ' ') {
      return;
    }

    const currentTarget = event.currentTarget;

    if (!(currentTarget instanceof HTMLElement) || !isAnchorTag.value) {
      return;
    }

    event.preventDefault();
    currentTarget.click();
  };

  return {
    mergedDisabled,
    isSelected,
    tag,
    nativeDisabled,
    ariaDisabled,
    href: resolvedHref,
    tabIndex,
    type,
    handleClick,
    handleKeydown,
  };
}
