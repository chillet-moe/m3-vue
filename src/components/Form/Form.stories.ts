import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Form from './Form.vue';
import FormField from '@/components/FormField/FormField.vue';
import TextField from '@/components/TextField/TextField.vue';
import CheckBox from '@/components/CheckBox/CheckBox.vue';
import Radio from '@/components/Radio/Radio.vue';
import Switch from '@/components/Switch/Switch.vue';
import Button from '@/components/Button/Button.vue';

const meta = {
  title: 'Form/Form',
  component: Form,
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => ({
    components: { Form, FormField, TextField, CheckBox, Radio, Switch, Button },
    setup: () => ({
      email: ref(''),
      password: ref(''),
      agree: ref(false),
      contact: ref(true),
      notification: ref(true),
    }),
    template: `
      <Form aria-label="Account form" style="max-inline-size: 28rem; padding: 1.5rem; border-radius: 1rem; background: var(--md-sys-color-surface-container-low);">
        <TextField label="Email" id="form-email" v-model="email" type="email" placeholder="name@example.com" supporting-text="We'll use this address to contact you." />

        <TextField label="Password" id="form-password" v-model="password" type="password" placeholder="Enter password" supporting-text="At least 8 characters." />

        <FormField error-text="You must accept terms before submitting.">
          <CheckBox v-model:checked="agree">I agree to the terms</CheckBox>
        </FormField>

        <FormField label="Preferred contact">
          <div style="display: grid; gap: 0.75rem;">
            <Radio v-model:checked="contact" name="contact-method" value="email">Email</Radio>
            <Radio :checked="!contact" name="contact-method" value="sms">SMS</Radio>
          </div>
        </FormField>

        <Switch v-model:checked="notification">Enable notifications</Switch>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.5rem;">
          <Button color="text">Cancel</Button>
          <Button color="filled">Submit</Button>
        </div>
      </Form>
    `,
  }),
};
