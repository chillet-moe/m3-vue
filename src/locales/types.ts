import type { MaybeRefOrGetter } from 'vue';

export type M3Messages = {
  common: {
    confirm: string;
    cancel: string;
  };
  datePicker: {
    chooseDate: string;
    previousMonth: string;
    nextMonth: string;
    previousYear: string;
    nextYear: string;
  };
  dateRangePicker: {
    chooseDateRange: string;
    startDate: string;
    endDate: string;
    startAndEndDate: (formattedDate: string) => string;
    selectedStartDate: (formattedDate: string) => string;
    selectedEndDate: (formattedDate: string) => string;
  };
  timePicker: {
    chooseTime: string;
    selectTime: string;
    selectHour: string;
    selectMinute: string;
    selectPeriod: string;
    switchToTextInput: string;
    switchToClockInput: string;
    hour: string;
    minute: string;
    enterHour: string;
    enterMinute: string;
    hourRange12: string;
    hourRange24: string;
    minuteRange: string;
    am: string;
    pm: string;
  };
  textField: {
    openDatePicker: (fieldLabel?: string) => string;
    openTimePicker: (fieldLabel?: string) => string;
  };
  select: {
    filterOptions: (fieldLabel?: string) => string;
    noMatchingOptions: string;
    clearSelection: string;
  };
};

export type M3MessageOverrides = {
  [Group in keyof M3Messages]?: Partial<M3Messages[Group]>;
};

export type M3LocaleDefinition = {
  locale: string;
  messages: M3Messages;
};

export type M3LocaleSource = string | M3LocaleDefinition;

export type M3LocaleOptions = {
  /**
   * A BCP 47 locale or a locale definition. Refs and getters can be used to switch languages at runtime.
   * A string changes locale-sensitive formatting only; messages continue to use the inherited or English defaults.
   */
  locale?: MaybeRefOrGetter<M3LocaleSource | undefined>;

  /** Message overrides applied after the selected locale definition. */
  messages?: MaybeRefOrGetter<M3MessageOverrides | undefined>;
};
