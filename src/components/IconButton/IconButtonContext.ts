import type { InjectionKey, MaybeRef } from 'vue';
import type { IconButtonProps } from "@/components/IconButton/IconButton.vue";

export interface IconButtonContext {
  toggleable?: MaybeRef<IconButtonProps['toggleable'] | undefined>;
  size?: MaybeRef<IconButtonProps['size'] | undefined>;
  color?: MaybeRef<IconButtonProps['color'] | undefined>;
  shape?: MaybeRef<IconButtonProps['shape'] | undefined>;
  width?: MaybeRef<IconButtonProps['width'] | undefined>;
  disabled?: MaybeRef<boolean | undefined>;
}

export const iconButtonContextKey: InjectionKey<IconButtonContext> = Symbol('IconButtonContext');