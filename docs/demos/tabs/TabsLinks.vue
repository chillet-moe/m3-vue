<script setup lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { Tab, TabList, TabPanel, Tabs } from '@/components/Tabs';

const routes = [
  { value: 'overview', label: 'Overview', to: '/settings/overview' },
  { value: 'security', label: 'Security', to: '/settings/security' },
  { value: 'notifications', label: 'Notifications', to: '/settings/notifications' },
] as const;

const currentPath = ref('/settings/overview');

const currentTab = computed({
  get() {
    return routes.find((route) => route.to === currentPath.value)?.value ?? routes[0].value;
  },
  set(value: string) {
    const match = routes.find((route) => route.value === value);
    if (match) {
      currentPath.value = match.to;
    }
  },
});

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
  <div style="display: grid; gap: 1rem">
    <Tabs v-model="currentTab">
      <TabList aria-label="Settings sections">
        <DemoRouterLink v-for="route in routes" :key="route.value" custom :to="route.to" v-slot="{ href, navigate }">
          <Tab :value="route.value" :href="href" @click="navigate">{{ route.label }}</Tab>
        </DemoRouterLink>
      </TabList>

      <TabPanel value="overview">Profile, billing, and language settings.</TabPanel>
      <TabPanel value="security">Password, passkeys, and device approvals.</TabPanel>
      <TabPanel value="notifications">Email digests and push notification rules.</TabPanel>
    </Tabs>

    <div>Current route: {{ currentPath }}</div>
  </div>
</template>
