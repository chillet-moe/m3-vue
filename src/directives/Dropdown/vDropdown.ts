import type { Directive, DirectiveBinding } from 'vue';
import './vDropdown.css';
import {
  hideDropdownElement,
  resolveDropdownAnchor,
  resolveDropdownTarget,
  shouldCloseOnOutsideClick,
  showDropdownElement,
  toggleDropdownElement,
} from './helpers';
import type { DropdownTargetBinding } from './helpers';

type CleanupRecord = {
  dropdown: HTMLElement;
  onClick: (event: MouseEvent) => void;
  onDropdownClick: (event: MouseEvent) => void;
  onDropdownKeydown: (event: KeyboardEvent) => void;
  onKeydown: (event: KeyboardEvent) => void;
  onDocPointerDown?: (event: PointerEvent) => void;
  previousAnchorAnchorName: string;
  previousDropdownPositionAnchor: string;
  previousTriggerAnchorName: string;
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
  trigger.removeEventListener('keydown', record.onKeydown);
  record.dropdown.removeEventListener('click', record.onDropdownClick);
  record.dropdown.removeEventListener('keydown', record.onDropdownKeydown);

  if (record.onDocPointerDown) {
    document.removeEventListener('pointerdown', record.onDocPointerDown, true);
  }

  if (record.previousTriggerAnchorName) {
    trigger.style.setProperty('anchor-name', record.previousTriggerAnchorName);
  } else {
    trigger.style.removeProperty('anchor-name');
  }

  if (record.source !== trigger) {
    if (record.previousAnchorAnchorName) {
      record.source.style.setProperty('anchor-name', record.previousAnchorAnchorName);
    } else {
      record.source.style.removeProperty('anchor-name');
    }
  }

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
    shouldCloseOnOutsideClick(binding) === (existingRecord.onDocPointerDown !== undefined)
  ) {
    return;
  }

  teardownDropdown(trigger);
  dropdown.classList.add('m3-dropdown');
  const anchorName = `--m3-dropdown-anchor-${dropdownAnchorId++}`;
  const previousTriggerAnchorName = trigger.style.getPropertyValue('anchor-name');
  const previousAnchorAnchorName = anchor.style.getPropertyValue('anchor-name');
  const previousDropdownPositionAnchor = dropdown.style.getPropertyValue('position-anchor');
  anchor.style.setProperty('anchor-name', anchorName);
  dropdown.style.setProperty('position-anchor', anchorName);

  let ignoreSyntheticClickUntil = 0;

  const restoreTriggerFocusIfDropdownClosed = () => {
    void Promise.resolve().then(() => {
      if (dropdown.matches(':popover-open')) {
        return;
      }

      trigger.focus();
    });
  };

  const onClick = (event: MouseEvent) => {
    if (event.detail === 0 && performance.now() < ignoreSyntheticClickUntil) {
      ignoreSyntheticClickUntil = 0;
      return;
    }

    event.preventDefault();
    toggleDropdownElement(dropdown, { source: anchor });
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
  trigger.addEventListener('keydown', onKeydown);
  dropdown.addEventListener('click', onDropdownClick);
  dropdown.addEventListener('keydown', onDropdownKeydown);

  let onDocPointerDown: ((event: PointerEvent) => void) | undefined;

  if (shouldCloseOnOutsideClick(binding)) {
    onDocPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (!target) {
        return;
      }

      if (trigger.contains(target) || dropdown.contains(target)) {
        return;
      }

      hideDropdownElement(dropdown);
    };

    document.addEventListener('pointerdown', onDocPointerDown, true);
  }

  cleanupMap.set(trigger, {
    dropdown,
    onClick,
    onKeydown,
    onDropdownClick,
    onDropdownKeydown,
    onDocPointerDown,
    previousAnchorAnchorName,
    previousDropdownPositionAnchor,
    previousTriggerAnchorName,
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
