import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';

import Chip from '@/components/Chip/Chip.vue';
import ChipGroup from './ChipGroup.vue';

const meta = {
  component: ChipGroup,
} satisfies Meta<typeof ChipGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => ({
    components: { Chip, ChipGroup },
    setup: () => ({
      selected: ref('selected'),
    }),
    template: `
      <ChipGroup v-model="selected" aria-label="Suggested filters">
        <Chip variant="assist" leading-icon="add">Assist</Chip>
        <Chip variant="suggestion" leading-icon="favorite">Suggestion</Chip>
        <Chip variant="filter" value="selected">Selected</Chip>
        <Chip variant="input" trailing-icon="close">Input</Chip>
      </ChipGroup>
    `,
  }),
};
