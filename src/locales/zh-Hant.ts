import type { M3LocaleDefinition } from './types';

export const zhHant = {
  locale: 'zh-Hant',
  messages: {
    common: {
      confirm: '確定',
      cancel: '取消',
    },
    datePicker: {
      chooseDate: '選擇日期',
      previousMonth: '上個月',
      nextMonth: '下個月',
      previousYear: '上一年',
      nextYear: '下一年',
    },
    dateRangePicker: {
      chooseDateRange: '選擇日期範圍',
      startDate: '開始日期',
      endDate: '結束日期',
      startAndEndDate: (formattedDate) => `開始和結束日期，${formattedDate}`,
      selectedStartDate: (formattedDate) => `開始日期，${formattedDate}`,
      selectedEndDate: (formattedDate) => `結束日期，${formattedDate}`,
    },
    timePicker: {
      chooseTime: '選擇時間',
      selectTime: '選擇時間',
      selectHour: '選擇小時',
      selectMinute: '選擇分鐘',
      selectPeriod: '選擇上午或下午',
      switchToTextInput: '切換到文字輸入',
      switchToClockInput: '切換到時鐘輸入',
      hour: '小時',
      minute: '分鐘',
      enterHour: '請輸入小時',
      enterMinute: '請輸入分鐘',
      hourRange12: '請輸入 1 至 12',
      hourRange24: '請輸入 0 至 23',
      minuteRange: '請輸入 0 至 59',
      am: '上午',
      pm: '下午',
    },
    textField: {
      openDatePicker: (fieldLabel) => (fieldLabel ? `選擇${fieldLabel}的日期` : '選擇日期'),
      openTimePicker: (fieldLabel) => (fieldLabel ? `選擇${fieldLabel}的時間` : '選擇時間'),
    },
    select: {
      filterOptions: (fieldLabel) => (fieldLabel ? `篩選${fieldLabel}` : '篩選選項'),
      noMatchingOptions: '沒有符合的選項',
      clearSelection: '清除選擇',
    },
  },
} satisfies M3LocaleDefinition;

export default zhHant;
