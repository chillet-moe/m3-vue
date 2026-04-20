<template>
  <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap">
    <div
      class="m3-state-layer"
      tabindex="0"
      role="button"
      style="
        width: 220px;
        height: 120px;
        border: 1px solid var(--md-sys-color-outline);
        border-radius: var(--md-sys-shape-corner-medium);
        background: var(--md-sys-color-surface-container);
        color: var(--md-sys-color-on-surface);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        cursor: pointer;
        user-select: none;
      "
    >
      <span>外层</span>
      <div
        class="m3-state-layer"
        tabindex="0"
        role="button"
        style="
          width: 72px;
          height: 40px;
          border: 1px solid var(--md-sys-color-primary);
          border-radius: var(--md-sys-shape-corner-full);
          background: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          font-size: 0.85em;
        "
        @click.stop
      >
        内层
      </div>
    </div>
  </div>
</template>
