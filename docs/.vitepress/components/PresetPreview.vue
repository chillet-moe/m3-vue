<script setup lang="ts">
import { computed, ref, useId } from 'vue';
import { useData } from 'vitepress';
import {
  Button,
  IconButton,
  Icon,
  Combobox,
  Radio,
  Switch,
  CheckBox,
  TextField,
  Select,
  ListItem,
  TreeView,
  Card,
  Dialog,
  BottomSheet,
  SideSheet,
  LinearProgressIndicator,
  CircularProgressIndicator,
} from '@/index';
import { useDocsCustomization } from '../customization/state';
import CustomizationGallery from './CustomizationGallery.vue';
import FieldLabelLayouts from './FieldLabelLayouts.vue';
const { state, setPreset, inheritedDefaults } = useDocsCustomization();
const { lang } = useData();
const isChinese = computed(() => lang.value.startsWith('zh'));
const prefix = useId();
const externalLabels = computed(
  () => (state.defaults.fieldLabelBehavior ?? inheritedDefaults.value.fieldLabelBehavior) === 'external',
);
const enabled = ref(true);
const dimensions = ref(true);
const name = ref('Assembly');
const search = ref('');
const units = ref('mm');
const fileName = ref('Assembly.step');
const dialogOpen = ref(false);
const bottomOpen = ref(false);
const sideOpen = ref(false);
const progress = ref(64);
</script>

<template>
  <div class="preset-preview vp-raw">
    <div class="preset-preview-choices">
      <Radio
        v-for="preset in ['default', 'compact'] as const"
        :key="preset"
        name="preset-preview"
        :checked="state.theme.preset === preset"
        @update:checked="$event && setPreset(preset)"
        >{{ preset }}</Radio
      >
    </div>
    <Card class="preset-preview-scene" color="outlined">
      <h2 class="preset-preview-title">{{ isChinese ? '筛选与操作' : 'Filters and actions' }}</h2>
      <div class="preset-preview-filter-row">
        <TextField
          v-model="search"
          :aria-label="isChinese ? '搜索零件' : 'Search parts'"
          :placeholder="isChinese ? '搜索零件…' : 'Search parts…'"
        >
          <template #leading><Icon name="search" /></template>
        </TextField>
        <Combobox
          v-model="units"
          :aria-label="isChinese ? '单位' : 'Units'"
          :options="['mm', 'cm', 'in'].map((value) => ({ value, label: value }))"
        />
        <Button variant="outlined" leading-icon="search">{{ isChinese ? '搜索' : 'Search' }}</Button>
      </div>
    </Card>
    <Card class="preset-preview-scene" color="outlined">
      <h2 class="preset-preview-title">{{ isChinese ? '编辑器与属性' : 'Editor and properties' }}</h2>
      <div class="preset-preview-toolbar">
        <Button leading-icon="add" @click="name = 'Untitled'">{{ isChinese ? '新建' : 'New' }}</Button>
        <Button leading-icon="file_export" @click="dialogOpen = true">{{ isChinese ? '导出' : 'Export' }}</Button>
        <IconButton icon="tune" :aria-label="isChinese ? '属性' : 'Properties'" @click="sideOpen = true" />
      </div>
      <div class="preset-preview-editor">
        <TreeView
          :items="[
            {
              value: 'assembly',
              label: name,
              icon: 'folder',
              children: [
                { value: 'base', label: isChinese ? '底板' : 'Base plate', icon: 'deployed_code' },
                { value: 'bracket', label: isChinese ? '支架' : 'Bracket', icon: 'deployed_code' },
              ],
            },
          ]"
        />
        <div class="preset-preview-form">
          <div class="preset-preview-labeled-field">
            <label v-if="externalLabels" :for="`${prefix}-field-1`">{{ isChinese ? '名称' : 'Name' }}</label
            ><TextField :id="`${prefix}-field-1`" v-model="name" :label="isChinese ? '名称' : 'Name'" />
          </div>
          <div class="preset-preview-labeled-field">
            <label v-if="externalLabels" :for="`${prefix}-field-2`">{{ isChinese ? '单位' : 'Units' }}</label
            ><Select
              :id="`${prefix}-field-2`"
              v-model="units"
              :label="isChinese ? '单位' : 'Units'"
              :options="['mm', 'cm', 'in'].map((value) => ({ value, label: value }))"
            />
          </div>
          <Switch v-model:checked="enabled">{{ isChinese ? '吸附到网格' : 'Snap to grid' }}</Switch>
          <CheckBox v-model:checked="dimensions">{{ isChinese ? '显示尺寸' : 'Show dimensions' }}</CheckBox>
        </div>
      </div>
    </Card>
    <Card class="preset-preview-scene" color="outlined">
      <h2 class="preset-preview-title">{{ isChinese ? '工作区设置' : 'Workspace settings' }}</h2>
      <div class="preset-preview-fields">
        <div class="preset-preview-labeled-field">
          <label v-if="externalLabels" :for="`${prefix}-field-3`">{{
            isChinese ? '工作区名称' : 'Workspace name'
          }}</label
          ><TextField :id="`${prefix}-field-3`" v-model="name" :label="isChinese ? '工作区名称' : 'Workspace name'" />
        </div>
        <div class="preset-preview-labeled-field">
          <label v-if="externalLabels" :for="`${prefix}-field-4`">{{ isChinese ? '默认单位' : 'Default units' }}</label
          ><Select
            :id="`${prefix}-field-4`"
            v-model="units"
            :label="isChinese ? '默认单位' : 'Default units'"
            :options="['mm', 'cm', 'in'].map((value) => ({ value, label: value }))"
          />
        </div>
      </div>
      <div class="preset-preview-choices">
        <Switch v-model:checked="enabled">{{ isChinese ? '吸附到网格' : 'Snap to grid' }}</Switch>
        <CheckBox v-model:checked="dimensions">{{ isChinese ? '显示尺寸' : 'Show dimensions' }}</CheckBox>
      </div>
      <div class="preset-preview-toolbar">
        <Button leading-icon="tune" @click="sideOpen = true">{{
          isChinese ? '打开属性面板' : 'Open properties'
        }}</Button>
        <Button @click="bottomOpen = true">{{ isChinese ? '打开底部面板' : 'Open bottom sheet' }}</Button>
      </div>
    </Card>
    <Card class="preset-preview-scene" color="outlined">
      <h2 class="preset-preview-title">{{ isChinese ? '导出任务' : 'Export tasks' }}</h2>
      <ListItem leading-icon="description" supporting-text="STEP">{{ fileName }}</ListItem>
      <div class="preset-preview-task">
        <CircularProgressIndicator
          :value="progress"
          :max="100"
          :aria-label="isChinese ? '导出进度' : 'Export progress'"
        />
        <span>{{ isChinese ? '正在导出' : 'Exporting' }} · {{ progress }}%</span>
        <Button @click="progress = progress === 100 ? 64 : 100">{{
          progress === 100 ? (isChinese ? '重新开始' : 'Restart') : isChinese ? '完成' : 'Complete'
        }}</Button>
      </div>
      <LinearProgressIndicator :value="progress" :max="100" :aria-label="isChinese ? '导出进度' : 'Export progress'" />
      <LinearProgressIndicator
        shape="wavy"
        :value="progress"
        :max="100"
        :aria-label="isChinese ? '导出进度' : 'Export progress'"
      />
    </Card>
    <Dialog v-model:open="dialogOpen">
      <template #headline>{{ isChinese ? '导出装配体' : 'Export assembly' }}</template>
      <div class="preset-preview-form">
        <div class="preset-preview-labeled-field">
          <label v-if="externalLabels" :for="`${prefix}-field-5`">{{ isChinese ? '文件名' : 'File name' }}</label
          ><TextField :id="`${prefix}-field-5`" v-model="fileName" :label="isChinese ? '文件名' : 'File name'" />
        </div>
        <CheckBox v-model:checked="dimensions">{{ isChinese ? '包含尺寸' : 'Include dimensions' }}</CheckBox>
      </div>
      <template #actions>
        <Button @click="dialogOpen = false">{{ isChinese ? '取消' : 'Cancel' }}</Button>
        <Button
          @click="
            dialogOpen = false;
            progress = 64;
          "
          >{{ isChinese ? '导出' : 'Export' }}</Button
        >
      </template>
    </Dialog>
    <SideSheet v-model:open="sideOpen">
      <template #headline>{{ isChinese ? '属性' : 'Properties' }}</template>
      <div class="preset-preview-form">
        <div class="preset-preview-labeled-field">
          <label v-if="externalLabels" :for="`${prefix}-field-6`">{{ isChinese ? '名称' : 'Name' }}</label
          ><TextField :id="`${prefix}-field-6`" v-model="name" :label="isChinese ? '名称' : 'Name'" />
        </div>
        <div class="preset-preview-labeled-field">
          <label v-if="externalLabels" :for="`${prefix}-field-7`">{{ isChinese ? '单位' : 'Units' }}</label
          ><Select
            :id="`${prefix}-field-7`"
            v-model="units"
            :label="isChinese ? '单位' : 'Units'"
            :options="['mm', 'cm', 'in'].map((value) => ({ value, label: value }))"
          />
        </div>
        <Switch v-model:checked="enabled">{{ isChinese ? '吸附到网格' : 'Snap to grid' }}</Switch>
      </div>
      <template #actions
        ><Button @click="sideOpen = false">{{ isChinese ? '关闭' : 'Close' }}</Button></template
      >
    </SideSheet>
    <BottomSheet v-model:open="bottomOpen">
      <template #headline>{{ isChinese ? '显示选项' : 'Display options' }}</template>
      <div class="preset-preview-form">
        <Switch v-model:checked="enabled">{{ isChinese ? '吸附到网格' : 'Snap to grid' }}</Switch>
        <CheckBox v-model:checked="dimensions">{{ isChinese ? '显示尺寸' : 'Show dimensions' }}</CheckBox>
      </div>
      <template #actions
        ><Button @click="bottomOpen = false">{{ isChinese ? '完成' : 'Done' }}</Button></template
      >
    </BottomSheet>
    <FieldLabelLayouts />
    <h2 class="preset-preview-title">{{ isChinese ? '组件图库' : 'Component gallery' }}</h2>
  </div>
  <CustomizationGallery />
</template>

<style scoped>
.preset-preview-filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--md-field-column-gap);
}

.preset-preview-labeled-field {
  display: grid;
  gap: 0.375rem;
  font: var(--md-sys-typescale-body-medium);
  min-inline-size: 0;
}

.preset-preview {
  display: grid;
  gap: 1.5rem;
  margin-block: 1.5rem;
}
.preset-preview-scene {
  display: grid;
  justify-content: normal;
  gap: 1rem;
  padding: 1rem;
  min-inline-size: 0;
}
.preset-preview-title {
  margin: 0;
  font: var(--md-sys-typescale-title-medium);
}
.preset-preview-choices,
.preset-preview-toolbar,
.preset-preview-task {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
.preset-preview-task {
  font: var(--md-sys-typescale-body-medium);
}
.preset-preview-fields,
.preset-preview-form {
  row-gap: var(--md-field-row-gap);
  column-gap: var(--md-field-column-gap);
  display: grid;
}
.preset-preview-fields {
  grid-template-columns: repeat(auto-fit, minmax(min(12rem, 100%), 1fr));
}
.preset-preview-editor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}
@media (max-width: 640px) {
  .preset-preview-editor {
    grid-template-columns: 1fr;
  }
}
</style>
