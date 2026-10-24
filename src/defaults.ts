import type { App } from 'vue';
import { selectContextKey, type SelectContext } from './components/Select/SelectContext';
import type { ButtonDefaults } from './components/Button/ButtonContext';
import type { IconButtonContext } from './components/IconButton/IconButtonContext';
import type { ListItemContext } from './components/ListItem/ListItemContext';
import type { SliderContext } from './components/Slider/SliderContext';
import type { MenuDefaultsContext } from './components/Menu/MenuDefaultsContext';
import { datePickerContextKey, type DatePickerContext } from './components/DatePicker/DatePickerContext';
import { timePickerContextKey, type TimePickerContext } from './components/TimePicker/TimePickerContext';

export type M3ComponentDefaultsOptions = {
  buttonDefaults?: ButtonDefaults;
  listItemDefaults?: ListItemContext;
  iconButtonSize?: IconButtonContext['size'];
  sliderDefaults?: SliderContext;
  selectDefaults?: SelectContext;
  menuColor?: MenuDefaultsContext['color'];
  datePickerDefaults?: DatePickerContext;
  timePickerDefaults?: TimePickerContext;
};

export function installM3InteractionDefaults(app: App, options: M3ComponentDefaultsOptions): void {
  if (options.selectDefaults !== undefined) app.provide(selectContextKey, options.selectDefaults);
  if (options.datePickerDefaults !== undefined) app.provide(datePickerContextKey, options.datePickerDefaults);
  if (options.timePickerDefaults !== undefined) app.provide(timePickerContextKey, options.timePickerDefaults);
}
