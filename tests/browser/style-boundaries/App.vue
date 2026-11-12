<script setup lang="ts">
import { ref } from 'vue';
import {
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  Chip,
  ChipGroup,
  ListItem,
  Menu,
  MenuDivider,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  Select,
  SelectionGroup,
  TextField,
} from '@/index';

const options = [{ label: 'Option', value: 'one' }];
const cardSubmissions = ref(0);
</script>

<template>
  <div class="comparison">
    <section
      v-for="context in ['outside', 'inside']"
      :key="context"
      :data-testid="context"
      :class="{ 'm3-prose': context === 'inside' }"
    >
      <h2>{{ context }}</h2>
      <Button href="#button" variant="filled">Button link</Button>
      <ListItem href="#row" title="List item link" />
      <TextField label="Text field" model-value="Value" />
      <Select label="Select" model-value="one" :options="options" />
      <MenuDivider />
      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationLink href="#page">1</PaginationLink></PaginationItem>
        </PaginationContent>
      </Pagination>
      <Breadcrumb :items="[{ label: 'Home', href: '#home' }, { label: 'Current' }]" />
      <Card>
        <a href="#card">Link inside card</a>
        <div class="m3-prose"><a href="#nested">Link in nested prose</a></div>
      </Card>
      <div data-m3-prose-exclude><a href="#widget">Custom widget link</a></div>
      <p><a href="#article">Article link</a></p>
      <ul data-testid="article-list">
        <li>Article item</li>
      </ul>
      <hr data-testid="article-rule" />
      <table data-testid="article-table">
        <tbody>
          <tr>
            <td>Article cell</td>
          </tr>
        </tbody>
      </table>
      <Menu />
    </section>
  </div>

  <SelectionGroup aria-label="Selections" data-testid="selection-group">
    <span>Selection content</span>
  </SelectionGroup>
  <ButtonGroup data-testid="button-group"><Button>Action</Button></ButtonGroup>
  <ChipGroup data-testid="chip-group"><Chip>Filter</Chip></ChipGroup>

  <form @submit.prevent="cardSubmissions++">
    <Card data-testid="passive-card"><span class="card-content">Card</span></Card>
    <Card clickable data-testid="clickable-card"><span class="card-content">Card</span></Card>
    <Card clickable type="submit" data-testid="submit-card"><span class="card-content">Submit</span></Card>
    <output data-testid="card-submissions">{{ cardSubmissions }}</output>
  </form>

  <div data-testid="list">
    <ListItem title="Standalone item" active data-testid="custom" style="--md-item-container-shape: 12px" />
    <ListItem
      title="Expressive override"
      active
      appearance="expressive"
      data-testid="indicator-override"
      style="--md-item-container-shape: 12px; --md-item-indicator-shape: 5px"
    />
    <section
      data-scope="list"
      data-part="container"
      style="--md-list-group-item-first-child-shape: 18px; --md-list-group-item-last-child-shape: 22px"
    >
      <ListItem title="Group one first" active appearance="expressive" data-testid="first-one" />
      <ListItem title="Group one last" active data-testid="last-one" />
    </section>
    <section
      data-scope="list"
      data-part="container"
      style="--md-list-group-item-first-child-shape: 30px; --md-list-group-item-last-child-shape: 34px"
    >
      <ListItem title="Group two first" active data-testid="first-two" />
      <hr />
      <ListItem title="Group two last" active appearance="expressive" data-testid="last-two" />
    </section>
    <section data-scope="list" data-part="container" style="--md-list-group-item-shape: 5px">
      <ListItem
        title="Square first"
        active
        appearance="expressive"
        shape="square"
        data-testid="square-first"
        style="--md-item-container-shape: 12px"
      />
      <article data-list-group-item data-shape="square" data-testid="square-middle">Custom middle item</article>
      <ListItem title="Square last" active shape="square" data-testid="square-last" />
    </section>
    <section
      data-scope="list"
      data-part="container"
      style="--md-list-group-item-first-child-shape: 19px; --md-list-group-item-last-child-shape: 23px"
    >
      <ListItem active :interactive="false" data-testid="only-rounded">
        <ListItem title="Nested item" active appearance="expressive" data-testid="nested" />
      </ListItem>
    </section>
  </div>
</template>

<style>
.comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
}

.card-content {
  display: block;
  inline-size: 4rem;
  block-size: 1.5rem;
}
</style>
