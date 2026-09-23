import type { Directive, DirectiveBinding } from 'vue';
import './vDropdown.css';
import { acquireAnchorName } from '@/internal/anchorName';
import { registerOutsidePointerDown } from '@/internal/outsidePointerDown';
import { startMenuPressDrag } from '@/internal/menuPressDrag';
import {
  hideDropdownElement,
  resolveDropdownAnchor,
  resolveDropdownTarget,
  needsCustomOutsideClick,
  showDropdownElement,
  toggleDropdownElement,
} from './helpers';
import type { DropdownTargetBinding } from './helpers';

type CleanupRecord = {
  dropdown: HTMLElement;
  onClick: (event: MouseEvent) => void;
  onPointerDown: (event: PointerEvent) => void;
  onDropdownClick: (event: MouseEvent) => void;
  onDropdownKeydown: (event: KeyboardEvent) => void;
  onKeydown: (event: KeyboardEvent) => void;
  cleanupOutsidePointerDown?: () => void;
  onToggle?: () => void;
  previousDropdownPositionAnchor: string;
  releaseAnchorName: () => void;
  cleanupPressDrag: () => void;
  source: HTMLElement;
};

const cleanupMap = new WeakMap<HTMLElement, CleanupRecord>();
let dropdownAnchorId = 0;

function teardownDropdown(trigger: HTMLElement) {
  const record = cleanupMap.get(trigger);

  if (!record) {
    return;
  }

  trigger.removeEventListener('click', record.onClick);
  trigger.removeEventListener('pointerdown', record.onPointerDown);
  trigger.removeEventListener('keydown', record.onKeydown);
  record.dropdown.removeEventListener('click', record.onDropdownClick);
  record.dropdown.removeEventListener('keydown', record.onDropdownKeydown);

  record.cleanupOutsidePointerDown?.();
  if (record.onToggle) record.dropdown.removeEventListener('toggle', record.onToggle);

  record.releaseAnchorName();
  record.cleanupPressDrag();

  if (record.previousDropdownPositionAnchor) {
    record.dropdown.style.setProperty('position-anchor', record.previousDropdownPositionAnchor);
  } else {
    record.dropdown.style.removeProperty('position-anchor');
  }

  cleanupMap.delete(trigger);
}

function setupDropdown(trigger: HTMLElement, binding: DirectiveBinding<DropdownTargetBinding>) {
  const dropdown = resolveDropdownTarget(binding);

  if (!dropdown) {
    teardownDropdown(trigger);
    return;
  }
  const anchor = resolveDropdownAnchor(binding, trigger);

  const existingRecord = cleanupMap.get(trigger);

  if (
    existingRecord &&
    existingRecord.dropdown === dropdown &&
    existingRecord.source === anchor &&
    needsCustomOutsideClick(binding, dropdown) === (existingRecord.onToggle !== undefined)
  ) {
    return;
  }

  teardownDropdown(trigger);
  dropdown.classList.add('m3-dropdown');
  const anchorName = `--m3-dropdown-anchor-${dropdownAnchorId++}`;
  const previousDropdownPositionAnchor = dropdown.style.getPropertyValue('position-anchor');
  const releaseAnchorName = acquireAnchorName(anchor, anchorName);
  dropdown.style.setProperty('position-anchor', anchorName);

  let ignoreSyntheticClickUntil = 0;
  let suppressPointerClick = false;
  let reopenAfterHeldClick = false;
  let cleanupPressDrag: (() => void) | undefined;
  let cleanupOpenMenuPress: (() => void) | undefined;

  const resetPointerClickAfterRelease = (pointerId: number) => {
    const onPointerEnd = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      cleanupOpenMenuPress?.();
      if (event.type === 'pointercancel' || !trigger.contains(event.target as Node)) {
        suppressPointerClick = false;
      }
    };

    const document = trigger.ownerDocument;
    document.addEventListener('pointerup', onPointerEnd, true);
    document.addEventListener('pointercancel', onPointerEnd, true);
    cleanupOpenMenuPress = () => {
      document.removeEventListener('pointerup', onPointerEnd, true);
      document.removeEventListener('pointercancel', onPointerEnd, true);
      cleanupOpenMenuPress = undefined;
    };
  };

  const restoreTriggerFocusIfDropdownClosed = () => {
    void Promise.resolve().then(() => {
      if (dropdown.matches(':popover-open')) {
        return;
      }

      trigger.focus();
    });
  };

  const onClick = (event: MouseEvent) => {
    if (suppressPointerClick) {
      suppressPointerClick = false;
      event.preventDefault();
      if (reopenAfterHeldClick && !dropdown.matches(':popover-open')) {
        showDropdownElement(dropdown, { source: anchor });
      }
      reopenAfterHeldClick = false;
      return;
    }

    if (event.detail === 0 && performance.now() < ignoreSyntheticClickUntil) {
      ignoreSyntheticClickUntil = 0;
      return;
    }

    event.preventDefault();
    toggleDropdownElement(dropdown, { source: anchor });
  };

  const onPointerDown = (event: PointerEvent) => {
    if (dropdown.getAttribute('role') !== 'menu') return;

    if (event.pointerType === 'mouse' && event.button === 0 && dropdown.matches(':popover-open')) {
      // An auto popover is light-dismissed on this pointerdown. Its following
      // click must not immediately reopen it.
      suppressPointerClick = true;
      reopenAfterHeldClick = false;
      cleanupOpenMenuPress?.();
      resetPointerClickAfterRelease(event.pointerId);
      return;
    }

    cleanupPressDrag?.();
    suppressPointerClick = false;
    reopenAfterHeldClick = false;
    cleanupPressDrag = startMenuPressDrag(event, {
      trigger,
      menu: dropdown,
      open: () => {
        suppressPointerClick = true;
        showDropdownElement(dropdown, { source: anchor });
      },
      close: () => hideDropdownElement(dropdown),
      onFinish: ({ releasedOnTrigger, heldTriggerPress }) => {
        cleanupPressDrag = undefined;
        if (!releasedOnTrigger) {
          suppressPointerClick = false;
          return;
        }

        reopenAfterHeldClick = heldTriggerPress;
      },
    });
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      return;
    }

    event.preventDefault();
    ignoreSyntheticClickUntil = performance.now() + 1_000;

    showDropdownElement(dropdown, {
      focus: event.key === 'ArrowUp' ? 'last' : 'first',
      source: anchor,
    });
  };

  const onDropdownClick = (event: MouseEvent) => {
    if (event.detail !== 0) {
      return;
    }

    restoreTriggerFocusIfDropdownClosed();
  };

  const onDropdownKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') {
      return;
    }

    restoreTriggerFocusIfDropdownClosed();
  };

  trigger.addEventListener('click', onClick);
  trigger.addEventListener('pointerdown', onPointerDown);
  trigger.addEventListener('keydown', onKeydown);
  dropdown.addEventListener('click', onDropdownClick);
  dropdown.addEventListener('keydown', onDropdownKeydown);

  let cleanupOutsidePointerDown: (() => void) | undefined;
  let onToggle: (() => void) | undefined;

  if (needsCustomOutsideClick(binding, dropdown)) {
    const syncOutsidePointerDown = () => {
      if (dropdown.matches(':popover-open')) {
        cleanupOutsidePointerDown ??= registerOutsidePointerDown(trigger.ownerDocument, {
          contains: (target) => trigger.contains(target) || dropdown.contains(target),
          onOutside: () => hideDropdownElement(dropdown),
        });
        return;
      }

      cleanupOutsidePointerDown?.();
      cleanupOutsidePointerDown = undefined;
    };

    onToggle = syncOutsidePointerDown;
    dropdown.addEventListener('toggle', onToggle);
    syncOutsidePointerDown();
  }

  cleanupMap.set(trigger, {
    dropdown,
    onClick,
    onPointerDown,
    onKeydown,
    onDropdownClick,
    onDropdownKeydown,
    cleanupOutsidePointerDown: onToggle
      ? () => {
          cleanupOutsidePointerDown?.();
          cleanupOutsidePointerDown = undefined;
        }
      : undefined,
    onToggle,
    previousDropdownPositionAnchor,
    releaseAnchorName,
    cleanupPressDrag: () => {
      cleanupPressDrag?.();
      cleanupOpenMenuPress?.();
    },
    source: anchor,
  });
}

const vDropdown: Directive<HTMLElement, DropdownTargetBinding> = {
  mounted(trigger, binding) {
    setupDropdown(trigger, binding);
  },
  updated(trigger, binding) {
    setupDropdown(trigger, binding);
  },
  unmounted(trigger) {
    teardownDropdown(trigger);
  },
};

export default vDropdown;
