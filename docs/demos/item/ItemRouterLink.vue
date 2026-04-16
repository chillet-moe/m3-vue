<script setup lang="ts">
import { defineComponent, ref } from 'vue';
import { Item } from '@/components/Item';

const currentPath = ref('/account/profile');

const DemoRouterLink = defineComponent({
  name: 'DemoRouterLink',
  props: {
    to: {
      type: String,
      required: true,
    },
    custom: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const navigate = (event?: Event) => {
      event?.preventDefault();
      currentPath.value = props.to;
    };

    return () =>
      slots.default?.({
        href: props.to,
        navigate,
        isActive: currentPath.value === props.to,
      });
  },
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 0.75rem; max-inline-size: 28rem">
    <DemoRouterLink custom to="/account/profile" v-slot="{ href, navigate, isActive }">
      <Item
        :href="href"
        :active="isActive"
        title="Profile"
        description="Manage your account details."
        media-icon="person"
        action-icon="chevron_right"
        @click="navigate"
      />
    </DemoRouterLink>

    <DemoRouterLink custom to="/account/security" v-slot="{ href, navigate, isActive }">
      <Item
        :href="href"
        :active="isActive"
        title="Security"
        description="Passwords, passkeys, and sign-in alerts."
        media-icon="shield"
        action-icon="chevron_right"
        @click="navigate"
      />
    </DemoRouterLink>

    <div>Current route: {{ currentPath }}</div>
  </div>
</template>
