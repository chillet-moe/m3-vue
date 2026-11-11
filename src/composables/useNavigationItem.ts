import { isHTMLElement } from '@/internal/elementEnvironment';
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

  const isSelected = computed(() => {
    const explicitSelected = selected();
    if (explicitSelected !== undefined) return explicitSelected;

    const itemValue = value();
    return context !== null && itemValue !== undefined && context.value.value === itemValue;
  });

  const link = useLinkTag({
    defaultTag: 'button',
    href,
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

    if (!isHTMLElement(currentTarget) || link.value.tag !== 'a') {
      return;
    }

    event.preventDefault();
    currentTarget.click();
  };

  return {
    mergedDisabled,
    isSelected,
    link,
    handleClick,
    handleKeydown,
  };
}
