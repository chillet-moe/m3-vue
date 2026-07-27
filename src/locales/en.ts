import type { M3LocaleDefinition } from './types';

export const en = {
  locale: 'en',
  messages: {
    common: {
      confirm: 'OK',
      cancel: 'Cancel',
    },
    datePicker: {
      chooseDate: 'Choose date',
      previousMonth: 'Previous month',
      nextMonth: 'Next month',
      previousYear: 'Previous year',
      nextYear: 'Next year',
    },
    dateRangePicker: {
      chooseDateRange: 'Choose date range',
      startDate: 'Start date',
      endDate: 'End date',
      startAndEndDate: (formattedDate) => `Start and end date, ${formattedDate}`,
      selectedStartDate: (formattedDate) => `Start date, ${formattedDate}`,
      selectedEndDate: (formattedDate) => `End date, ${formattedDate}`,
    },
    timePicker: {
      chooseTime: 'Choose time',
      selectTime: 'Select time',
      selectHour: 'Select hour',
      selectMinute: 'Select minute',
      selectPeriod: 'Select AM or PM',
      switchToTextInput: 'Switch to text input',
      switchToClockInput: 'Switch to clock input',
      hour: 'Hour',
      minute: 'Minute',
      enterHour: 'Enter hour',
      enterMinute: 'Enter minute',
      hourRange12: 'Use 1-12',
      hourRange24: 'Use 0-23',
      minuteRange: 'Use 0-59',
      am: 'AM',
      pm: 'PM',
    },
    textField: {
      openDatePicker: (fieldLabel) => (fieldLabel ? `Choose ${fieldLabel}` : 'Choose date'),
      openTimePicker: (fieldLabel) => (fieldLabel ? `Choose ${fieldLabel}` : 'Choose time'),
    },
    select: {
      filterOptions: (fieldLabel) => (fieldLabel ? `Filter ${fieldLabel}` : 'Filter options'),
      noMatchingOptions: 'No matching options',
      clearSelection: 'Clear selection',
    },
  },
} satisfies M3LocaleDefinition;

export default en;
