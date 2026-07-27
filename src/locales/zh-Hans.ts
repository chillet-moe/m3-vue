import type { M3LocaleDefinition } from './types';

export const zhHans = {
  locale: 'zh-Hans',
  messages: {
    common: {
      confirm: '确定',
      cancel: '取消',
    },
    datePicker: {
      chooseDate: '选择日期',
      previousMonth: '上个月',
      nextMonth: '下个月',
      previousYear: '上一年',
      nextYear: '下一年',
    },
    dateRangePicker: {
      chooseDateRange: '选择日期范围',
      startDate: '开始日期',
      endDate: '结束日期',
      startAndEndDate: (formattedDate) => `开始和结束日期，${formattedDate}`,
      selectedStartDate: (formattedDate) => `开始日期，${formattedDate}`,
      selectedEndDate: (formattedDate) => `结束日期，${formattedDate}`,
    },
    timePicker: {
      chooseTime: '选择时间',
      selectTime: '选择时间',
      selectHour: '选择小时',
      selectMinute: '选择分钟',
      selectPeriod: '选择上午或下午',
      switchToTextInput: '切换到文本输入',
      switchToClockInput: '切换到时钟输入',
      hour: '小时',
      minute: '分钟',
      enterHour: '请输入小时',
      enterMinute: '请输入分钟',
      hourRange12: '请输入 1 至 12',
      hourRange24: '请输入 0 至 23',
      minuteRange: '请输入 0 至 59',
      am: '上午',
      pm: '下午',
    },
    textField: {
      openDatePicker: (fieldLabel) => (fieldLabel ? `选择${fieldLabel}的日期` : '选择日期'),
      openTimePicker: (fieldLabel) => (fieldLabel ? `选择${fieldLabel}的时间` : '选择时间'),
    },
    select: {
      filterOptions: (fieldLabel) => (fieldLabel ? `筛选${fieldLabel}` : '筛选选项'),
      noMatchingOptions: '没有匹配的选项',
      clearSelection: '清除选择',
    },
  },
} satisfies M3LocaleDefinition;

export default zhHans;
