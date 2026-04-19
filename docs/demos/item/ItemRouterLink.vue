<script setup lang="ts">
import { defineComponent, ref } from 'vue';
import { ListItem } from '@/components/ListItem';

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
  <div style="display: flex; flex-direction: column; gap: 0.125rem; max-inline-size: 28rem">
    <DemoRouterLink custom to="/account/profile" v-slot="{ href, navigate, isActive }">
      <ListItem :href="href" :active="isActive" leading-icon="person" trailing-icon="chevron_right" @click="navigate">
        Profile
        <template #description>Manage your account details.</template>
      </ListItem>
    </DemoRouterLink>

    <DemoRouterLink custom to="/account/security" v-slot="{ href, navigate, isActive }">
      <ListItem :href="href" :active="isActive" leading-icon="shield" trailing-icon="chevron_right" @click="navigate">
        Security
        <template #description>Passwords, passkeys, and sign-in alerts.</template>
      </ListItem>
    </DemoRouterLink>

    <div>Current route: {{ currentPath }}</div>
  </div>
</template>
