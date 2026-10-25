import { badgeStyleTokens } from './style-tokens/Badge';
import { bottomSheetStyleTokens } from './style-tokens/BottomSheet';
import { breadcrumbStyleTokens } from './style-tokens/Breadcrumb';
import { buttonStyleTokens } from './style-tokens/Button';
import { buttonGroupStyleTokens } from './style-tokens/ButtonGroup';
import { cardStyleTokens } from './style-tokens/Card';
import { checkBoxStyleTokens } from './style-tokens/CheckBox';
import { chipStyleTokens } from './style-tokens/Chip';
import { circularProgressIndicatorStyleTokens } from './style-tokens/CircularProgressIndicator';
import { datePickerStyleTokens } from './style-tokens/DatePicker';
import { dateRangePickerStyleTokens } from './style-tokens/DateRangePicker';
import { dialogStyleTokens } from './style-tokens/Dialog';
import { dividerStyleTokens } from './style-tokens/Divider';
import { floatingActionButtonStyleTokens } from './style-tokens/FloatingActionButton';
import { floatingActionButtonMenuStyleTokens } from './style-tokens/FloatingActionButtonMenu';
import { iconStyleTokens } from './style-tokens/Icon';
import { iconButtonStyleTokens } from './style-tokens/IconButton';
import { inputOtpStyleTokens } from './style-tokens/InputOtp';
import { linearProgressIndicatorStyleTokens } from './style-tokens/LinearProgressIndicator';
import { listGroupingStyleTokens } from './style-tokens/ListGrouping';
import { listItemStyleTokens } from './style-tokens/ListItem';
import { loadingIndicatorStyleTokens } from './style-tokens/LoadingIndicator';
import { menuStyleTokens } from './style-tokens/Menu';
import { navigationDrawerStyleTokens } from './style-tokens/NavigationDrawer';
import { navigationRailStyleTokens } from './style-tokens/NavigationRail';
import { paginationStyleTokens } from './style-tokens/Pagination';
import { popoverStyleTokens } from './style-tokens/Popover';
import { radioStyleTokens } from './style-tokens/Radio';
import { sideSheetStyleTokens } from './style-tokens/SideSheet';
import { sliderStyleTokens } from './style-tokens/Slider';
import { skeletonStyleTokens } from './style-tokens/Skeleton';
import { snackbarStyleTokens } from './style-tokens/Snackbar';
import { switchStyleTokens } from './style-tokens/Switch';
import { tabsStyleTokens } from './style-tokens/Tabs';
import { treeViewStyleTokens } from './style-tokens/TreeView';
import { textFieldStyleTokens } from './style-tokens/TextField';
import { timePickerStyleTokens } from './style-tokens/TimePicker';
import { tooltipStyleTokens } from './style-tokens/Tooltip';
import type { StyleTokenMeta } from './style-tokens/types';

export type { StyleTokenMeta } from './style-tokens/types';

export const styleTokenMeta: Record<string, StyleTokenMeta[]> = {
  Badge: badgeStyleTokens,
  BottomSheet: bottomSheetStyleTokens,
  Breadcrumb: breadcrumbStyleTokens,
  Button: buttonStyleTokens,
  ButtonGroup: buttonGroupStyleTokens,
  Card: cardStyleTokens,
  CheckBox: checkBoxStyleTokens,
  Chip: chipStyleTokens,
  CircularProgressIndicator: circularProgressIndicatorStyleTokens,
  DatePicker: datePickerStyleTokens,
  DateRangePicker: dateRangePickerStyleTokens,
  Dialog: dialogStyleTokens,
  Divider: dividerStyleTokens,
  FloatingActionButton: floatingActionButtonStyleTokens,
  FloatingActionButtonMenu: floatingActionButtonMenuStyleTokens,
  Icon: iconStyleTokens,
  IconButton: iconButtonStyleTokens,
  InputOtp: inputOtpStyleTokens,
  LinearProgressIndicator: linearProgressIndicatorStyleTokens,
  ListGrouping: listGroupingStyleTokens,
  ListItem: listItemStyleTokens,
  LoadingIndicator: loadingIndicatorStyleTokens,
  Menu: menuStyleTokens,
  NavigationDrawer: navigationDrawerStyleTokens,
  NavigationRail: navigationRailStyleTokens,
  Pagination: paginationStyleTokens,
  Popover: popoverStyleTokens,
  Radio: radioStyleTokens,
  SideSheet: sideSheetStyleTokens,
  Slider: sliderStyleTokens,
  Skeleton: skeletonStyleTokens,
  Snackbar: snackbarStyleTokens,
  Switch: switchStyleTokens,
  Tabs: tabsStyleTokens,
  TreeView: treeViewStyleTokens,
  TextField: textFieldStyleTokens,
  TimePicker: timePickerStyleTokens,
  Tooltip: tooltipStyleTokens,
};
