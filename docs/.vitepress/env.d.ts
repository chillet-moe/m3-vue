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

declare module 'virtual:component-anatomy' {
  import type { ComponentAnatomy } from './plugins/component-anatomy';
  const anatomy: Record<string, ComponentAnatomy>;
  export default anatomy;
}

declare module 'virtual:component-anatomy/*' {
  import type { ComponentAnatomy } from './plugins/component-anatomy';
  const anatomy: ComponentAnatomy | null;
  export default anatomy;
}
