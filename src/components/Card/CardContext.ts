import type { InjectionKey, MaybeRef } from 'vue';
import type { CardProps } from "@/components/Card/Card.vue";

export interface CardContext {
  color?: MaybeRef<CardProps['color'] | undefined>;
  clickable?: MaybeRef<CardProps['clickable'] | undefined>;
}

export const cardContextKey: InjectionKey<CardContext> = Symbol('CardContext');