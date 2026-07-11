<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue';
import Button from '@/components/Button/Button.vue';
import IconButton from '@/components/IconButton/IconButton.vue';
import {
  type ClockOption,
  type TimePickerFormat,
  type TimePickerInputMode,
  type TimePickerModelValue,
  type TimePickerVariant,
  useTimePicker,
} from '@/components/TimePicker/useTimePicker';
import { usePickerPopover } from '@/composables/usePickerPopover';

export type { TimePickerFormat, TimePickerInputMode, TimePickerModelValue, TimePickerVariant };

export type TimePickerProps = {
  /** Optional explicit id for the popover element. */
  id?: string;

  /** Visual and positioning mode. Auto uses docked layout until a narrow/coarse pointer viewport. */
  variant?: TimePickerVariant;

  /** CSS anchor name used to position the docked popover. */
  anchorName?: string;

  /** Element passed to showPopover as the source for focus and dismissal semantics. */
  anchorElement?: HTMLElement;

  /** Accessible label for the picker surface. */
  ariaLabel?: string;

  /** Visible title. */
  titleText?: string;

  /** Clock format. */
  format?: TimePickerFormat;

  /** Initial input mode. If omitted, 12h starts in clock mode and 24h starts in keyboard mode. */
  inputMode?: TimePickerInputMode;

  /** Text for the confirmation button. */
  confirmText?: string;

  /** Text for the cancel button. */
  cancelText?: string;
};

const props = withDefaults(defineProps<TimePickerProps>(), {
  id: undefined,
  variant: 'auto',
  anchorName: undefined,
  anchorElement: undefined,
  ariaLabel: 'Choose time',
  titleText: 'Select time',
  format: '12h',
  inputMode: undefined,
  confirmText: 'OK',
  cancelText: 'Cancel',
});

const emit = defineEmits<{
  /** Fired when a time is committed to the model. */
  change: [value: TimePickerModelValue];

  /** Fired when the user cancels the draft selection. */
  cancel: [];

  /** Fired when the user confirms the draft selection. */
  confirm: [value: TimePickerModelValue];
}>();

const modelValue = defineModel<TimePickerModelValue>();
const open = defineModel<boolean>('open', { default: false });

const generatedId = useId();
const popoverRef = ref<HTMLDivElement>();
const surfaceRef = ref<HTMLElement>();
const hourInputRef = ref<HTMLInputElement>();
const minuteInputRef = ref<HTMLInputElement>();
const localInputMode = ref<TimePickerInputMode>();
const activePointerId = ref<number>();
const pointerStart = ref<{ x: number; y: number }>();
const movedInPointerStream = ref(false);
const suppressNextClockClick = ref(false);

const pickerId = computed(() => props.id ?? `m3-time-picker-${generatedId}`);

const titleId = computed(() => `${pickerId.value}-title`);

const hourErrorId = computed(() => `${pickerId.value}-hour-error`);

const minuteErrorId = computed(() => `${pickerId.value}-minute-error`);

const popoverStyle = computed(() => {
  return props.anchorName ? { 'position-anchor': props.anchorName } : undefined;
});

const currentInputMode = computed(() => localInputMode.value ?? props.inputMode);

const picker = useTimePicker({
  modelValue,
  format: () => props.format,
  inputMode: currentInputMode,
  onChange: (value) => emit('change', value),
  onCancel: () => emit('cancel'),
  onConfirm: (value) => emit('confirm', value),
});

const clockHandStyle = computed(() => ({
  '--_time-picker-hand-angle': `${picker.clockHandAngle.value}deg`,
  '--_time-picker-hand-radius': picker.clockHandRing.value === 'inner' ? '30%' : '42%',
}));

function getClockOptionStyle(option: ClockOption) {
  const radians = (option.angle * Math.PI) / 180;
  const radius = option.ring === 'inner' ? 28 : 40;

  return {
    insetInlineStart: `${roundClockCoordinate(50 + Math.sin(radians) * radius)}%`,
    insetBlockStart: `${roundClockCoordinate(50 - Math.cos(radians) * radius)}%`,
  };
}

function roundClockCoordinate(value: number) {
  return Math.round(value * 1000) / 1000;
}

async function focusMinuteInput() {
  await nextTick();
  minuteInputRef.value?.focus();
  minuteInputRef.value?.select();
}

async function focusFirstControl() {
  await nextTick();

  if (picker.inputMode.value === 'keyboard') {
    hourInputRef.value?.focus();
    hourInputRef.value?.select();
    return;
  }

  surfaceRef.value?.querySelector<HTMLElement>('[data-selected="true"]')?.focus();
}

const popover = usePickerPopover({
  open,
  popoverRef,
  anchorElement: () => props.anchorElement,
  onBeforeOpen: () => {
    localInputMode.value = undefined;
    picker.resetDraftFromModel();
  },
  onAfterOpen: focusFirstControl,
});

function handleCancel() {
  picker.cancelDraft();
  popover.hide();
}

function handleConfirm() {
  if (picker.confirmDraft()) {
    popover.hide();
  }
}

function toggleInputMode() {
  localInputMode.value = picker.inputMode.value === 'clock' ? 'keyboard' : 'clock';
  void focusFirstControl();
}

function handleHourInput(event: Event) {
  picker.setInputHourText((event.target as HTMLInputElement).value);

  if (picker.inputHourText.value.length === 2) {
    void focusMinuteInput();
  }
}

function handleHourInputKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter') {
    return;
  }

  event.preventDefault();
  void focusMinuteInput();
}

function handleMinuteInputKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter') {
    return;
  }

  event.preventDefault();
  handleConfirm();
}

function getClockPointerState(event: PointerEvent) {
  const target = event.currentTarget;

  if (!(target instanceof HTMLElement)) {
    return undefined;
  }

  const rect = target.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  const normalizedAngle = (angle + 360) % 360;
  const distance = Math.hypot(dx, dy);
  const inner = distance < rect.width * 0.36;

  return {
    normalizedAngle,
    inner,
  };
}

function getClockHour(rotation: number, inner: boolean) {
  const hour = Math.floor((Math.round(rotation) + 15) / 30) % 12;

  if (picker.format.value === '24h') {
    return inner ? hour + 12 : hour;
  }

  return hour === 0 ? 12 : hour;
}

function getClockMinute(rotation: number, snapToFiveMinutes: boolean) {
  const rotationInt = Math.round(rotation);

  if (snapToFiveMinutes) {
    return (Math.floor((rotationInt + 15) / 30) * 5) % 60;
  }

  return Math.floor((rotationInt + 3) / 6) % 60;
}

function updateClockFromPointer(event: PointerEvent, actionUp: boolean) {
  const pointerState = getClockPointerState(event);

  if (!pointerState) {
    return;
  }

  if (picker.activeSelection.value === 'minute') {
    picker.selectMinute(getClockMinute(pointerState.normalizedAngle, actionUp && !movedInPointerStream.value));
    return;
  }

  picker.selectHour(getClockHour(pointerState.normalizedAngle, pointerState.inner), actionUp);
}

function handleClockPointerDown(event: PointerEvent) {
  if (event.button !== 0) {
    return;
  }

  const target = event.currentTarget;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  event.preventDefault();
  activePointerId.value = event.pointerId;
  pointerStart.value = { x: event.clientX, y: event.clientY };
  movedInPointerStream.value = false;
  suppressNextClockClick.value = event.target !== target;
  target.setPointerCapture(event.pointerId);
  updateClockFromPointer(event, false);
}

function handleClockPointerMove(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) {
    return;
  }

  const start = pointerStart.value;

  if (start) {
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    movedInPointerStream.value ||= deltaX * deltaX + deltaY * deltaY > 16;
  }

  updateClockFromPointer(event, false);
}

function handleClockPointerUp(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) {
    return;
  }

  const target = event.currentTarget;

  if (target instanceof HTMLElement && target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }

  updateClockFromPointer(event, true);
  activePointerId.value = undefined;
  pointerStart.value = undefined;
}

function handleClockPointerCancel(event: PointerEvent) {
  if (activePointerId.value !== event.pointerId) {
    return;
  }

  activePointerId.value = undefined;
  pointerStart.value = undefined;
}

function handleClockOptionClick(event: MouseEvent, option: ClockOption) {
  if (suppressNextClockClick.value) {
    suppressNextClockClick.value = false;
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (picker.activeSelection.value === 'hour') {
    picker.selectHour(option.value);
    return;
  }

  picker.selectMinute(option.value);
}

function handleClockKeydown(event: KeyboardEvent) {
  const delta =
    event.key === 'ArrowUp' || event.key === 'ArrowRight'
      ? 1
      : event.key === 'ArrowDown' || event.key === 'ArrowLeft'
        ? -1
        : 0;

  if (delta === 0) {
    return;
  }

  event.preventDefault();

  if (picker.activeSelection.value === 'minute') {
    picker.selectMinute((picker.draftMinute.value + delta + 60) % 60);
    return;
  }

  if (picker.format.value === '24h') {
    picker.selectHour((picker.draftHour.value + delta + 24) % 24);
    return;
  }

  const nextHour = (picker.draftHour.value + delta + 24) % 24;
  picker.selectHour(nextHour % 12 || 12);
}

watch(
  () => modelValue.value,
  () => {
    if (!open.value) {
      picker.resetDraftFromModel();
    }
  },
);

defineExpose({
  popoverEl: popoverRef,
  show: popover.show,
  hide: popover.hide,
  toggle: popover.toggle,
});
</script>

<template>
  <div
    :id="pickerId"
    ref="popoverRef"
    class="m3-time-picker"
    popover="auto"
    role="dialog"
    data-scope="time-picker"
    data-part="root"
    :data-variant="props.variant"
    :data-format="picker.format.value"
    :data-input-mode="picker.inputMode.value"
    :aria-label="props.ariaLabel"
    :aria-labelledby="titleId"
    :style="popoverStyle"
    @toggle="popover.handlePopoverToggle"
  >
    <div ref="surfaceRef" class="m3-time-picker-surface" data-scope="time-picker" data-part="surface">
      <header class="m3-time-picker-header" data-scope="time-picker" data-part="header">
        <div :id="titleId" class="m3-time-picker-title" data-scope="time-picker" data-part="title">
          {{ props.titleText }}
        </div>

        <div
          v-if="picker.inputMode.value === 'clock'"
          class="m3-time-picker-display"
          data-scope="time-picker"
          data-part="display"
        >
          <button
            type="button"
            class="m3-time-picker-display-field m3-state-layer"
            data-scope="time-picker"
            data-part="hour-display"
            :data-selected="picker.activeSelection.value === 'hour' ? 'true' : undefined"
            :aria-pressed="picker.activeSelection.value === 'hour' ? 'true' : 'false'"
            @click="picker.activeSelection.value = 'hour'"
          >
            {{ picker.displayHour.value }}
          </button>

          <span class="m3-time-picker-display-separator" data-scope="time-picker" data-part="display-separator">:</span>

          <button
            type="button"
            class="m3-time-picker-display-field m3-state-layer"
            data-scope="time-picker"
            data-part="minute-display"
            :data-selected="picker.activeSelection.value === 'minute' ? 'true' : undefined"
            :aria-pressed="picker.activeSelection.value === 'minute' ? 'true' : 'false'"
            @click="picker.activeSelection.value = 'minute'"
          >
            {{ picker.displayMinute.value }}
          </button>

          <div
            v-if="picker.format.value === '12h'"
            class="m3-time-picker-period"
            data-scope="time-picker"
            data-part="period-selector"
            role="group"
            aria-label="Select AM or PM"
          >
            <button
              type="button"
              class="m3-time-picker-period-button m3-state-layer"
              data-scope="time-picker"
              data-part="period-option"
              :data-selected="picker.period.value === 'AM' ? 'true' : undefined"
              :aria-pressed="picker.period.value === 'AM' ? 'true' : 'false'"
              @click="picker.setPeriod('AM')"
            >
              AM
            </button>
            <button
              type="button"
              class="m3-time-picker-period-button m3-state-layer"
              data-scope="time-picker"
              data-part="period-option"
              :data-selected="picker.period.value === 'PM' ? 'true' : undefined"
              :aria-pressed="picker.period.value === 'PM' ? 'true' : 'false'"
              @click="picker.setPeriod('PM')"
            >
              PM
            </button>
          </div>
        </div>
      </header>

      <div
        v-if="picker.inputMode.value === 'clock'"
        class="m3-time-picker-clock"
        data-scope="time-picker"
        data-part="clock"
      >
        <div
          class="m3-time-picker-clock-face"
          data-scope="time-picker"
          data-part="clock-face"
          :aria-label="picker.activeSelection.value === 'hour' ? 'Select hour' : 'Select minute'"
          @pointerdown="handleClockPointerDown"
          @pointermove="handleClockPointerMove"
          @pointerup="handleClockPointerUp"
          @pointercancel="handleClockPointerCancel"
          @keydown="handleClockKeydown"
        >
          <div
            class="m3-time-picker-clock-hand"
            data-scope="time-picker"
            data-part="clock-hand"
            aria-hidden="true"
            :style="clockHandStyle"
          />

          <button
            v-for="option in picker.clockOptions.value"
            :key="`${picker.activeSelection.value}-${option.value}`"
            type="button"
            class="m3-time-picker-clock-option m3-state-layer"
            data-scope="time-picker"
            data-part="clock-option"
            :data-selected="option.selected ? 'true' : undefined"
            :data-ring="option.ring"
            :style="getClockOptionStyle(option)"
            :aria-pressed="option.selected ? 'true' : 'false'"
            @click.stop="handleClockOptionClick($event, option)"
            @keydown="handleClockKeydown"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div v-else class="m3-time-picker-inputs" data-scope="time-picker" data-part="inputs">
        <label class="m3-time-picker-input-field" data-scope="time-picker" data-part="hour-input-field">
          <input
            ref="hourInputRef"
            class="m3-time-picker-input"
            data-scope="time-picker"
            data-part="hour-input"
            inputmode="numeric"
            autocomplete="off"
            :value="picker.inputHourText.value"
            :aria-invalid="picker.hourInputInvalid.value ? 'true' : undefined"
            :aria-describedby="picker.hourInputError.value ? hourErrorId : undefined"
            @input="handleHourInput"
            @focus="picker.activeSelection.value = 'hour'"
            @keydown="handleHourInputKeydown"
            @blur="
              picker.touchInput('hour');
              picker.applyInputText();
            "
          />
          <span class="m3-time-picker-input-label" data-scope="time-picker" data-part="input-label">Hour</span>
          <span
            v-if="picker.hourInputError.value"
            :id="hourErrorId"
            class="m3-time-picker-input-error"
            data-scope="time-picker"
            data-part="input-error"
          >
            {{ picker.hourInputError.value }}
          </span>
        </label>

        <span class="m3-time-picker-input-separator" data-scope="time-picker" data-part="input-separator">:</span>

        <label class="m3-time-picker-input-field" data-scope="time-picker" data-part="minute-input-field">
          <input
            ref="minuteInputRef"
            class="m3-time-picker-input"
            data-scope="time-picker"
            data-part="minute-input"
            inputmode="numeric"
            autocomplete="off"
            :value="picker.inputMinuteText.value"
            :aria-invalid="picker.minuteInputInvalid.value ? 'true' : undefined"
            :aria-describedby="picker.minuteInputError.value ? minuteErrorId : undefined"
            @input="picker.setInputMinuteText(($event.target as HTMLInputElement).value)"
            @focus="picker.activeSelection.value = 'minute'"
            @keydown="handleMinuteInputKeydown"
            @blur="
              picker.touchInput('minute');
              picker.applyInputText();
            "
          />
          <span class="m3-time-picker-input-label" data-scope="time-picker" data-part="input-label">Minute</span>
          <span
            v-if="picker.minuteInputError.value"
            :id="minuteErrorId"
            class="m3-time-picker-input-error"
            data-scope="time-picker"
            data-part="input-error"
          >
            {{ picker.minuteInputError.value }}
          </span>
        </label>

        <div
          v-if="picker.format.value === '12h'"
          class="m3-time-picker-period"
          data-scope="time-picker"
          data-part="period-selector"
          role="group"
          aria-label="Select AM or PM"
        >
          <button
            type="button"
            class="m3-time-picker-period-button m3-state-layer"
            data-scope="time-picker"
            data-part="period-option"
            :data-selected="picker.period.value === 'AM' ? 'true' : undefined"
            :aria-pressed="picker.period.value === 'AM' ? 'true' : 'false'"
            @click="picker.setPeriod('AM')"
          >
            AM
          </button>
          <button
            type="button"
            class="m3-time-picker-period-button m3-state-layer"
            data-scope="time-picker"
            data-part="period-option"
            :data-selected="picker.period.value === 'PM' ? 'true' : undefined"
            :aria-pressed="picker.period.value === 'PM' ? 'true' : 'false'"
            @click="picker.setPeriod('PM')"
          >
            PM
          </button>
        </div>
      </div>

      <div class="m3-time-picker-actions" data-scope="time-picker" data-part="actions">
        <IconButton
          :icon="picker.inputMode.value === 'clock' ? 'keyboard' : 'schedule'"
          color="standard"
          size="small"
          :aria-label="picker.inputMode.value === 'clock' ? 'Switch to text input' : 'Switch to clock input'"
          data-scope="time-picker"
          data-part="mode-toggle"
          @click="toggleInputMode"
        />
        <span class="m3-time-picker-actions-spacer" data-scope="time-picker" data-part="actions-spacer" />
        <Button color="text" @click="handleCancel">{{ props.cancelText }}</Button>
        <Button color="text" :disabled="picker.inputInvalid.value" @click="handleConfirm">{{
          props.confirmText
        }}</Button>
      </div>
    </div>
  </div>
</template>

<style src="./TimePicker.css"></style>
