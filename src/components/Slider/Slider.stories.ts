import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import Slider from './Slider.vue';
import type { SliderProps } from '@/components/Slider/Slider.vue';
import { getArgs } from '@/utils/storybook.ts';

const meta = {
  component: Slider,
  args: {
    min: 0,
    max: 5,
    step: 1,
    value: 2,
    size: 'medium',
    direction: 'ltr',
    vertical: false,
    disabled: false,
    valueIndicator: true,
    formatter: {
      valueToText: (value: number) => `${value}`,
      textToValue: (text?: string) => (text ? Number(text) : undefined),
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['extra-small', 'small', 'medium', 'large', 'extra-large'],
    },
    direction: {
      control: 'select',
      options: ['ltr', 'rtl'],
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

interface SliderArgs extends SliderProps {
  value: number;
  enum?: 'size' | 'direction';
}

interface SliderEnumArgs extends SliderArgs {
  enum: 'size' | 'direction';
}

const BaseTemplate: StoryFn<SliderArgs> = (args: SliderArgs) => ({
  components: { Slider },
  setup: () => ({ args }),
  template: `
    <Slider
      v-bind="args"
      v-model:value="args.value"
      :stop-indicators="Array.from({ length: (args.max - args.min) / args.step + 1 }, (_, i) => args.min + i * args.step)"
    />
  `,
});

const EnumTemplate: StoryFn<SliderEnumArgs> = (args: SliderEnumArgs, { argTypes }) => ({
  components: { Slider },
  setup: () => ({ args, argTypes, getArgs }),
  template: `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div v-for="option in argTypes?.[args.enum]?.options" :key="option">
        <div style="font-size: 0.75rem; opacity: 0.7; margin-bottom: 0.25rem;">{{ option }}</div>
        <Slider
          v-bind="getArgs(args, option)"
          v-model:value="args.value"
          :stop-indicators="Array.from({ length: (args.max - args.min) / args.step + 1 }, (_, i) => args.min + i * args.step)"
        />
      </div>
    </div>
  `,
});

const VerticalTemplate: StoryFn<SliderEnumArgs> = (args: SliderEnumArgs, { argTypes }) => ({
  components: { Slider },
  setup: () => ({ args, argTypes, getArgs }),
  template: `
    <div style="display: flex; gap: 2rem; align-items: flex-end;">
      <div v-for="option in argTypes?.[args.enum]?.options" :key="option">
        <div style="font-size: 0.75rem; opacity: 0.7; margin-bottom: 0.25rem;">{{ option }}</div>
        <Slider
          v-bind="getArgs(args, option)"
          v-model:value="args.value"
          style="height: 12rem;"
          :stop-indicators="Array.from({ length: (args.max - args.min) / args.step + 1 }, (_, i) => args.min + i * args.step)"
        />
      </div>
    </div>
  `,
});

export const Default: Story = BaseTemplate.bind({});

export const Directions = EnumTemplate.bind({});
Directions.args = { enum: 'direction' };

export const Vertical = VerticalTemplate.bind({});
Vertical.args = { enum: 'direction', vertical: true };

export const Sizes = EnumTemplate.bind({});
Sizes.args = { enum: 'size' };

export const Disabled = BaseTemplate.bind({});
Disabled.args = { disabled: true };
