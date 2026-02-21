import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta = {
  title: 'Utilities/Elevation',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: () => ({
    template: `
<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
  <div
    style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center;
      width: 100px; 
      height: 100px; 
      border-radius: var(--md-sys-shape-corner-small);
      box-shadow: var(--md-sys-elevation-level0);
    ">
    <span>Elevation 0</span>
  </div>
  <div
    style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center;
      width: 100px; 
      height: 100px; 
      border-radius: var(--md-sys-shape-corner-small);
      box-shadow: var(--md-sys-elevation-level1);
    ">
    <span>Elevation 1</span>
  </div>
  <div
    style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center;
      width: 100px; 
      height: 100px; 
      border-radius: var(--md-sys-shape-corner-small);
      box-shadow: var(--md-sys-elevation-level2);
    ">
    <span>Elevation 2</span>
  </div>
  <div
    style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center;
      width: 100px; 
      height: 100px; 
      border-radius: var(--md-sys-shape-corner-small);
      box-shadow: var(--md-sys-elevation-level3);
    ">
    <span>Elevation 3</span>
  </div>
  <div
    style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center;
      width: 100px; 
      height: 100px; 
      border-radius: var(--md-sys-shape-corner-small);
      box-shadow: var(--md-sys-elevation-level4);
    ">
    <span>Elevation 4</span>
  </div>
  <div
    style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center;
      width: 100px; 
      height: 100px; 
      border-radius: var(--md-sys-shape-corner-small);
      box-shadow: var(--md-sys-elevation-level5);
    ">
    <span>Elevation 5</span>
  </div>
</div>`,
  }),
};
