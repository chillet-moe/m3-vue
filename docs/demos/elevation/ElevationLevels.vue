<template>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; padding: 0.5rem 0">
    <div
      v-for="level in 6"
      :key="level"
      :style="{
        minHeight: '100px',
        borderRadius: 'var(--md-sys-shape-corner-medium)',
        background: 'var(--md-sys-color-surface-container-low)',
        color: 'var(--md-sys-color-on-surface)',
        boxShadow: `var(--md-sys-elevation-level${level - 1})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '1rem',
      }"
    >
      Elevation {{ level - 1 }}
    </div>
  </div>
</template>
