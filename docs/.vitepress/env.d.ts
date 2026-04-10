/// <reference types="vitepress/client" />

declare module 'virtual:component-meta' {
  import type { ComponentMeta } from './plugins/component-meta';
  const meta: Record<string, ComponentMeta>;
  export default meta;
}

declare module 'virtual:component-meta/*' {
  import type { ComponentMeta } from './plugins/component-meta';
  const meta: ComponentMeta | null;
  export default meta;
}
