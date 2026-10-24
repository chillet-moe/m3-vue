// State Layer
export { initStateLayer } from './components/StateLayer/state-layer';

// Styles
import './styles/theme.css';

// Localization
export * from './locales';

// Shapes
export * from './shapes/animatable';
export * from './shapes/animatableSmall';
export * from './styles/context';

// Composables
export { usePressedState } from './composables/pressedState.ts';
export { usePressShapeMorph } from './composables/usePressShapeMorph.ts';
export type { PressShapeMorphAttrs, UsePressShapeMorphOptions } from './composables/usePressShapeMorph.ts';
export { useTabs } from './composables/useTabs';
export type { UseTabsOptions, UseTabsReturn } from './composables/useTabs';
export { useMenu } from './composables/useMenu';
export type { UseMenuOptions, UseMenuReturn } from './composables/useMenu';
export { useSelect } from './composables/useSelect';
export type { UseSelectOptions, UseSelectReturn } from './composables/useSelect';
export { useAnimatedNumber } from './composables/useAnimatedNumber';
export type { UseAnimatedNumberOptions, UseAnimatedNumberReturn } from './composables/useAnimatedNumber';
export { usePopover } from './composables/usePopover';
export type { UsePopoverOptions, UsePopoverReturn, UsePopoverShowOptions } from './composables/usePopover';
export { useAccordion } from './composables/useAccordion';
export type {
  AccordionItemOptions,
  AccordionItemValue,
  AccordionModelValue,
  UseAccordionOptions,
  UseAccordionReturn,
} from './composables/useAccordion';
export { useDelegatedTooltip } from './composables/useDelegatedTooltip';
export type { DelegatedTooltipSlot, DelegatedTooltipSlotState } from './composables/useDelegatedTooltip';

// Directives
export * from './directives';
export * from './plugin';

// Components
export * from './components/Badge';
export * from './components/BottomSheet';
export * from './components/Breadcrumb';
export * from './components/Button';
export * from './components/ButtonGroup';
export * from './components/SelectionGroup';
export * from './components/IconButton';
export * from './components/InputOtp';
export * from './components/Slider';
export * from './components/Skeleton';
export * from './components/Icon';
export * from './components/Tooltip';
export * from './components/Card';
export * from './components/Chip';
export * from './components/ChipGroup';
export * from './components/DatePicker';
export * from './components/DateRangePicker';
export * from './components/Dialog';
export * from './components/Divider';
export * from './components/FloatingActionButton';
export * from './components/FloatingActionButtonMenu';
export * from './components/Snackbar';
export * from './components/Switch';
export * from './components/Radio';
export * from './components/CheckBox';
export * from './components/CircularProgressIndicator';
export * from './components/ListItem';
export * from './components/LinearProgressIndicator';
export * from './components/LoadingIndicator';
export * from './components/Menu';
export * from './components/NavigationDrawer';
export * from './components/NavigationRail';
export * from './components/OverlayHost';
export * from './components/Pagination';
export * from './components/Popover';
export * from './components/TextField';
export * from './components/Select';
export * from './components/SideSheet';
export * from './components/Combobox';
export * from './components/Tabs';
export * from './components/TimePicker';

// Resolver
export { M3VueResolver } from './resolver';

// Plugin
export { M3VuePlugin } from './plugin';

export type { M3VuePluginOptions } from './plugin';
export type { M3FieldOptions, M3Shape, M3ShapeOptions } from './styles/context';
export type { M3ComponentDefaultsOptions } from './defaults';

export { createOverlayHost, provideOverlayHost, useOverlayHost } from './internal/overlayHost/overlayHost';
export type { OverlayHostController } from './internal/overlayHost/overlayHost';
export { createOverlayService, useOverlays } from './overlays';
export type { OverlayService } from './overlays';
