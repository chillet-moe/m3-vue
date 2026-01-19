import type { Meta, StoryFn, StoryObj } from '@storybook/vue3-vite';
import ButtonGroup from './ButtonGroup.vue';
import Button from '@/components/Button/Button.vue';
import type { ButtonGroupProps } from '@/components/ButtonGroup/ButtonGroup.vue';
import { getArgs } from '@/utils/storybook.ts';

const meta = {
  component: ButtonGroup,
  args: {
    type: 'standard',
    size: 'small',
    color: 'tonal',
    disabled: false,
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

interface ButtonGroupArgs extends ButtonGroupProps {
  enum?: 'type' | 'size' | 'color';
  inputType?: 'radio' | 'checkbox';
}

const BaseTemplate: StoryFn<ButtonGroupArgs> = (args: ButtonGroupArgs) => ({
  components: { ButtonGroup, Button },
  setup: () => ({ args }),
  template: `
    <ButtonGroup v-bind="args">
      <Button>
        <input :type="args.inputType || 'radio'" name="button-group" />
        Option 1
      </Button>
      <Button>
        <input :type="args.inputType || 'radio'" name="button-group" />
        Option 2
      </Button>
      <Button>
        <input :type="args.inputType || 'radio'" name="button-group" />
        Option 3
      </Button>
    </ButtonGroup>
  `,
});

const EnumTemplate: StoryFn<ButtonGroupArgs> = (args: ButtonGroupArgs, { argTypes }) => ({
  components: { ButtonGroup, Button },
  setup: () => ({ args, argTypes, getArgs }),
  template: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div v-for="option in argTypes?.[args.enum]?.options" :key="option">
        <div style="font-size: 0.75rem; opacity: 0.7; margin-bottom: 0.25rem;">{{ option }}</div>
        <ButtonGroup v-bind="getArgs(args, option)">
          <Button>
            <input :type="args.inputType || 'radio'" :name="'button-group-' + option" />
            Option 1
          </Button>
          <Button>
            <input :type="args.inputType || 'radio'" :name="'button-group-' + option" />
            Option 2
          </Button>
          <Button>
            <input :type="args.inputType || 'radio'" :name="'button-group-' + option" />
            Option 3
          </Button>
        </ButtonGroup>
      </div>
    </div>
  `,
});

export const Default: Story = BaseTemplate.bind({});

export const Types = EnumTemplate.bind({});
Types.args = { enum: 'type' };

export const Sizes = EnumTemplate.bind({});
Sizes.args = { enum: 'size' };

export const Colors = EnumTemplate.bind({});
Colors.args = { enum: 'color' };

export const Disabled = BaseTemplate.bind({});
Disabled.args = { disabled: true };

export const Multiple = BaseTemplate.bind({});
Multiple.args = { inputType: 'checkbox' };
