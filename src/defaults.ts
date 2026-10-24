import type { App } from 'vue';
import type { ButtonContext } from './components/Button/ButtonContext';
import type { IconButtonContext } from './components/IconButton/IconButtonContext';
import type { SliderContext } from './components/Slider/SliderContext';
import type { MenuDefaultsContext } from './components/Menu/MenuDefaultsContext';
import { datePickerContextKey, type DatePickerContext } from './components/DatePicker/DatePickerContext';
import { timePickerContextKey, type TimePickerContext } from './components/TimePicker/TimePickerContext';

export type M3ComponentDefaultsOptions = {
  buttonSize?: ButtonContext['size'];
  iconButtonSize?: IconButtonContext['size'];
  sliderAppearance?: SliderContext['appearance'];
  sliderSize?: SliderContext['size'];
  menuColor?: MenuDefaultsContext['color'];
  datePickerDefaults?: DatePickerContext;
  timePickerDefaults?: TimePickerContext;
};

export function installM3InteractionDefaults(app: App, options: M3ComponentDefaultsOptions): void {
  if (options.datePickerDefaults !== undefined) app.provide(datePickerContextKey, options.datePickerDefaults);
  if (options.timePickerDefaults !== undefined) app.provide(timePickerContextKey, options.timePickerDefaults);
}
