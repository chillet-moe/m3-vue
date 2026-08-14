<script setup lang="ts">
import { ListItem } from '@/components/ListItem';
</script>

<template>
  <section class="list-grouping-boundaries" data-scope="list" data-part="container">
    <h3 class="list-grouping-boundaries__heading">Account</h3>
    <ListItem class="list-grouping-boundaries__item" title="Profile" leading-icon="person" />
    <p class="list-grouping-boundaries__note">This unmarked note does not participate in first/last matching.</p>
    <ListItem class="list-grouping-boundaries__item" title="Security" leading-icon="shield" />

    <div class="list-grouping-boundaries__nested" data-scope="list" data-part="container">
      <span class="list-grouping-boundaries__nested-label">Nested group</span>
      <ListItem class="list-grouping-boundaries__item" title="Passkeys" shape="square" />
      <ListItem class="list-grouping-boundaries__item" title="Recovery codes" shape="square" />
    </div>

    <ListItem class="list-grouping-boundaries__item" title="Sign out" leading-icon="logout" />
  </section>
</template>

<style scoped>
.list-grouping-boundaries {
  display: grid;
  gap: --dp(2);
  inline-size: min(24rem, 100%);
}

.list-grouping-boundaries__heading,
.list-grouping-boundaries__note,
.list-grouping-boundaries__nested {
  margin: 0;
}

.list-grouping-boundaries__heading {
  @apply title-medium;

  padding: --dp(8) --dp(16) --dp(4);
}

.list-grouping-boundaries__item {
  --md-button-container-color: var(--md-sys-color-surface-container);
}

.list-grouping-boundaries__note {
  @apply body-small;

  padding: --dp(10) --dp(16);
  color: var(--md-sys-color-on-surface-variant);
  background: var(--md-sys-color-surface-container-low);
}

.list-grouping-boundaries__nested {
  display: grid;
  gap: --dp(2);
  margin: --dp(8) --dp(16);
  padding: --dp(8);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-shape-card);
}

.list-grouping-boundaries__nested-label {
  @apply label-medium;

  padding: --dp(4) --dp(8);
  color: var(--md-sys-color-on-surface-variant);
}
</style>
