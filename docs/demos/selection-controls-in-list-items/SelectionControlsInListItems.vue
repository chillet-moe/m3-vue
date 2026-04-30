<script setup lang="ts">
import { ref } from 'vue';
import { CheckBox } from '@/components/CheckBox';
import { ListItem } from '@/components/ListItem';
import { Radio } from '@/components/Radio';
import { Switch } from '@/components/Switch';

const notifications = ref(true);
const theme = ref('system');
const wifi = ref(false);

function toggleNotifications() {
  notifications.value = !notifications.value;
}

function selectTheme(value: string) {
  theme.value = value;
}

function toggleWifi() {
  wifi.value = !wifi.value;
}
</script>

<template>
  <div style="display: grid; gap: 0.25rem; max-inline-size: 28rem">
    <ListItem
      role="checkbox"
      :aria-checked="notifications ? 'true' : 'false'"
      title="Notifications"
      description="Send product updates and security alerts."
      @click="toggleNotifications"
    >
      <template #trailing>
        <CheckBox :checked="notifications" presentation />
      </template>
    </ListItem>

    <div role="radiogroup" aria-label="Theme">
      <ListItem
        role="radio"
        :aria-checked="theme === 'system' ? 'true' : 'false'"
        title="Use system theme"
        description="Follow the device appearance setting."
        @click="selectTheme('system')"
      >
        <template #trailing>
          <Radio :checked="theme === 'system'" presentation />
        </template>
      </ListItem>

      <ListItem
        role="radio"
        :aria-checked="theme === 'dark' ? 'true' : 'false'"
        title="Dark theme"
        description="Always use dark appearance."
        @click="selectTheme('dark')"
      >
        <template #trailing>
          <Radio :checked="theme === 'dark'" presentation />
        </template>
      </ListItem>
    </div>

    <ListItem
      role="switch"
      :aria-checked="wifi ? 'true' : 'false'"
      title="Wi-Fi"
      description="Connect automatically to known networks."
      @click="toggleWifi"
    >
      <template #trailing>
        <Switch :checked="wifi" presentation />
      </template>
    </ListItem>
  </div>
</template>
