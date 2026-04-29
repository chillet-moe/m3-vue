export interface StyleTokenMeta {
  name: string;
  description: string;
  fallback: string;
  category?: string;
}

export const styleTokenMeta: Record<string, StyleTokenMeta[]> = {
  CheckBox: [
    {
      name: '--md-checkbox-color',
      description: 'Default selected container color and selected state layer color.',
      fallback: 'var(--md-sys-color-primary)',
      category: 'Color',
    },
    {
      name: '--md-checkbox-on-color',
      description: 'Default selected icon color.',
      fallback: 'var(--md-sys-color-on-primary)',
      category: 'Color',
    },
    {
      name: '--md-checkbox-unselected-outline-color',
      description: 'Outline color for the unchecked box.',
      fallback: 'var(--md-sys-color-on-surface-variant)',
      category: 'Color',
    },
    {
      name: '--md-checkbox-selected-container-color',
      description: 'Container color for the checked box.',
      fallback: 'var(--md-checkbox-color)',
      category: 'Color',
    },
    {
      name: '--md-checkbox-selected-icon-color',
      description: 'Checkmark color for the checked box.',
      fallback: 'var(--md-checkbox-on-color)',
      category: 'Color',
    },
    {
      name: '--md-checkbox-unselected-state-layer-color',
      description: 'State layer color when unchecked.',
      fallback: 'var(--md-sys-color-on-surface)',
      category: 'State',
    },
    {
      name: '--md-checkbox-state-layer-color',
      description: 'Shortcut for the checked state layer color.',
      fallback: 'var(--md-checkbox-color)',
      category: 'State',
    },
    {
      name: '--md-checkbox-selected-state-layer-color',
      description: 'State layer color when checked.',
      fallback: 'var(--md-checkbox-state-layer-color)',
      category: 'State',
    },
    {
      name: '--md-checkbox-disabled-color',
      description: 'Base color used by disabled checkbox visuals.',
      fallback: 'var(--md-sys-color-on-surface)',
      category: 'Disabled',
    },
    {
      name: '--md-checkbox-disabled-opacity',
      description: 'Default opacity for disabled checkbox visuals.',
      fallback: '0.38',
      category: 'Disabled',
    },
    {
      name: '--md-checkbox-disabled-unselected-outline-color',
      description: 'Outline color for disabled unchecked state.',
      fallback: 'var(--md-checkbox-disabled-color)',
      category: 'Disabled',
    },
    {
      name: '--md-checkbox-disabled-unselected-outline-opacity',
      description: 'Outline opacity for disabled unchecked state.',
      fallback: 'var(--md-checkbox-disabled-opacity)',
      category: 'Disabled',
    },
    {
      name: '--md-checkbox-disabled-selected-container-color',
      description: 'Container color for disabled checked state.',
      fallback: 'var(--md-checkbox-disabled-color)',
      category: 'Disabled',
    },
    {
      name: '--md-checkbox-disabled-selected-container-opacity',
      description: 'Container opacity for disabled checked state.',
      fallback: 'var(--md-checkbox-disabled-opacity)',
      category: 'Disabled',
    },
    {
      name: '--md-checkbox-disabled-selected-icon-color',
      description: 'Checkmark color for disabled checked state.',
      fallback: 'var(--md-sys-color-surface)',
      category: 'Disabled',
    },
    {
      name: '--md-checkbox-disabled-selected-icon-opacity',
      description: 'Checkmark opacity for disabled checked state.',
      fallback: 'var(--md-checkbox-disabled-opacity)',
      category: 'Disabled',
    },
    {
      name: '--md-checkbox-label-color',
      description: 'Color of the optional label slot.',
      fallback: 'var(--md-sys-color-on-surface)',
      category: 'Label',
    },
    {
      name: '--md-checkbox-container-size',
      description: 'Size of the visible checkbox box.',
      fallback: '--dp(18)',
      category: 'Layout',
    },
    {
      name: '--md-checkbox-target-size',
      description: 'Size of the interactive control and state layer area.',
      fallback: '--dp(40)',
      category: 'Layout',
    },
    {
      name: '--md-checkbox-state-layer-shape',
      description: 'Shape of the state layer area.',
      fallback: 'var(--md-sys-shape-corner-full)',
      category: 'Shape',
    },
    {
      name: '--md-checkbox-shape',
      description: 'Corner radius of the visible checkbox box.',
      fallback: '--dp(2)',
      category: 'Shape',
    },
    {
      name: '--md-checkbox-outline-width',
      description: 'Outline width of the unchecked box.',
      fallback: '--dp(2)',
      category: 'Layout',
    },
    {
      name: '--md-checkbox-focus-indicator-color',
      description: 'Focus ring color.',
      fallback: 'var(--md-sys-color-secondary)',
      category: 'Focus',
    },
    {
      name: '--md-checkbox-focus-indicator-thickness',
      description: 'Focus ring thickness.',
      fallback: 'var(--md-sys-state-focus-indicator-thickness)',
      category: 'Focus',
    },
    {
      name: '--md-checkbox-focus-indicator-offset',
      description: 'Focus ring offset.',
      fallback: 'var(--md-sys-state-focus-indicator-outer-offset)',
      category: 'Focus',
    },
  ],
  CircularProgressIndicator: [
    {
      name: '--md-progress-indicator-color',
      description: 'Shared active indicator color for progress indicators.',
      fallback: 'var(--md-color-on-container, var(--md-sys-color-primary))',
      category: 'Color',
    },
    {
      name: '--md-progress-indicator-track-color',
      description: 'Shared track color for progress indicators.',
      fallback: 'var(--md-color-container, var(--md-sys-color-secondary-container))',
      category: 'Color',
    },
    {
      name: '--md-circular-progress-indicator-active-indicator-color',
      description: 'Active arc color for the circular indicator.',
      fallback: 'var(--md-progress-indicator-color)',
      category: 'Color',
    },
    {
      name: '--md-circular-progress-indicator-track-color',
      description: 'Track arc color for the circular indicator.',
      fallback: 'var(--md-progress-indicator-track-color)',
      category: 'Color',
    },
    {
      name: '--md-circular-progress-indicator-size',
      description: 'Default size for the circular indicator.',
      fallback: '--dp(40)',
      category: 'Layout',
    },
    {
      name: '--md-circular-progress-indicator-with-wave-size',
      description: 'Default size when using the wavy shape.',
      fallback: '--dp(48)',
      category: 'Layout',
    },
    {
      name: '--md-circular-progress-indicator-track-thickness',
      description: 'Stroke thickness for track and active arcs.',
      fallback: '--dp(4)',
      category: 'Layout',
    },
    {
      name: '--md-circular-progress-indicator-track-active-indicator-gap',
      description: 'Gap between active arc and track arc.',
      fallback: '--dp(4)',
      category: 'Layout',
    },
    {
      name: '--md-circular-progress-indicator-wave-amplitude',
      description: 'Amplitude for the wavy active arc.',
      fallback: '--dp(1.6)',
      category: 'Wave',
    },
    {
      name: '--md-circular-progress-indicator-wave-wavelength',
      description: 'Wavelength for the wavy active arc.',
      fallback: '--dp(15)',
      category: 'Wave',
    },
  ],
  LinearProgressIndicator: [
    {
      name: '--md-progress-indicator-color',
      description: 'Shared active indicator color for progress indicators.',
      fallback: 'var(--md-color-on-container, var(--md-sys-color-primary))',
      category: 'Color',
    },
    {
      name: '--md-progress-indicator-track-color',
      description: 'Shared track color for progress indicators.',
      fallback: 'var(--md-color-container, var(--md-sys-color-secondary-container))',
      category: 'Color',
    },
    {
      name: '--md-progress-indicator-stop-indicator-color',
      description: 'Shared stop indicator color for linear progress.',
      fallback: 'var(--md-progress-indicator-color)',
      category: 'Color',
    },
    {
      name: '--md-linear-progress-indicator-active-indicator-color',
      description: 'Active segment color for the linear indicator.',
      fallback: 'var(--md-progress-indicator-color)',
      category: 'Color',
    },
    {
      name: '--md-linear-progress-indicator-track-color',
      description: 'Track color for the linear indicator.',
      fallback: 'var(--md-progress-indicator-track-color)',
      category: 'Color',
    },
    {
      name: '--md-linear-progress-indicator-stop-indicator-color',
      description: 'Stop indicator color for determinate linear progress.',
      fallback: 'var(--md-progress-indicator-stop-indicator-color)',
      category: 'Color',
    },
    {
      name: '--md-linear-progress-indicator-track-thickness',
      description: 'Height of the track and active segment.',
      fallback: '--dp(4)',
      category: 'Layout',
    },
    {
      name: '--md-linear-progress-indicator-track-active-indicator-gap',
      description: 'Gap between active segment and track in determinate partial state.',
      fallback: '--dp(4)',
      category: 'Layout',
    },
    {
      name: '--md-linear-progress-indicator-stop-indicator-size',
      description: 'Size of the stop indicator dot.',
      fallback: '--dp(4)',
      category: 'Layout',
    },
    {
      name: '--md-linear-progress-indicator-shape',
      description: 'Corner radius for track, active segment, and stop indicator.',
      fallback: 'var(--md-sys-shape-corner-full)',
      category: 'Shape',
    },
    {
      name: '--md-linear-progress-indicator-wave-amplitude',
      description: 'Amplitude for the wavy active segment.',
      fallback: '--dp(3)',
      category: 'Wave',
    },
    {
      name: '--md-linear-progress-indicator-wave-wavelength',
      description: 'Wavelength for determinate wavy progress.',
      fallback: '--dp(40)',
      category: 'Wave',
    },
    {
      name: '--md-linear-progress-indicator-indeterminate-wave-wavelength',
      description: 'Wavelength for indeterminate wavy progress.',
      fallback: '--dp(20)',
      category: 'Wave',
    },
    {
      name: '--md-linear-progress-indicator-with-wave-height',
      description: 'Minimum height when using the wavy shape.',
      fallback: '--dp(10)',
      category: 'Wave',
    },
  ],
};
