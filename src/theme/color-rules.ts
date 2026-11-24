import roleInputs from './color-roles.json' with { type: 'json' };

// CSS variables resolve references at their declaration site. Emit the same bindings
// at the application root, a dynamic palette boundary and each named theme boundary.
const roles: Record<string, string> = {};
for (const name of Object.keys(roleInputs)) {
  if (!name.endsWith('-light')) continue;
  const role = name.slice(0, -'-light'.length);
  roles[role] = `light-dark(var(${name}), var(${role}-dark))`;
}

const elevation: Record<string, string> = {
  '--md-sys-elevation-shadow-key': 'rgb(from var(--md-sys-color-shadow) r g b / 0.19)',
  '--md-sys-elevation-shadow-ambient': 'rgb(from var(--md-sys-color-shadow) r g b / 0.04)',
};
for (let level = 0; level <= 5; level++) {
  const name = `--md-sys-elevation-level${level}`;
  elevation[name] =
    `var(${name}-key) var(--md-sys-elevation-shadow-key), var(${name}-ambient) var(--md-sys-elevation-shadow-ambient)`;
}

const shared = {
  ...roles,
  ...elevation,
  '--md-overlay-menu-color':
    'light-dark(var(--md-sys-color-surface-container-low), var(--md-sys-color-surface-container-high))',
  '--md-overlay-container-color':
    'light-dark(var(--md-sys-color-surface-container), var(--md-sys-color-surface-container-high))',
  '--md-overlay-modal-color':
    'light-dark(var(--md-sys-color-surface-container-high), var(--md-sys-color-surface-container-highest))',
  '--md-overlay-on-container-color': 'var(--md-sys-color-on-surface)',
  '--md-overlay-shadow-key-color': 'light-dark(rgb(0 0 0 / 8%), rgb(0 0 0 / 38%))',
  '--md-overlay-shadow-ambient-color': 'light-dark(rgb(0 0 0 / 4%), rgb(0 0 0 / 32%))',
  '--md-overlay-elevation':
    '0 2px 6px var(--md-overlay-shadow-key-color), 0 8px 24px var(--md-overlay-shadow-ambient-color)',
  '--md-overlay-modal-elevation':
    '0 4px 8px var(--md-overlay-shadow-key-color), 0 12px 32px var(--md-overlay-shadow-ambient-color)',
};

const context = {
  '--md-color-container': 'initial',
  '--md-color-on-container': 'initial',
  '--md-state-layer-color': 'initial',
  '--md-control-outline-color': 'var(--md-sys-color-outline-variant)',
};
const local = {
  '--md-focus-ring-color': 'initial',
  '--md-overlay-border-color': 'var(--md-sys-color-outline-variant)',
  color: 'var(--md-sys-color-on-surface)',
};

export function cssRule(selector: string, declarations: Record<string, string>) {
  const body = Object.entries(declarations).map(([name, value]) => `    ${name}: ${value};`);
  return `  ${selector} {\n${body.join('\n')}\n  }`;
}

export const libraryColorRules = [
  cssRule(':where(:root, .m3-color-theme)', context),
  cssRule(':root,\n  :where(.m3-color-theme)', shared),
  cssRule(':where(.m3-color-theme)', local),
];

export function namedColorRule(selectors: string[]) {
  return cssRule(`:where(${selectors.join(', ')})`, { ...roleInputs, ...shared, ...context, ...local });
}
