type AnchorNameRecord = {
  initialValue: string;
  names: Map<string, number>;
};

const records = new WeakMap<HTMLElement, AnchorNameRecord>();

function normalizeAnchorNameValue(value: string) {
  const trimmed = value.trim();
  return trimmed && trimmed !== 'none' ? trimmed : '';
}

function syncAnchorNames(anchor: HTMLElement, record: AnchorNameRecord) {
  const initialValue = normalizeAnchorNameValue(record.initialValue);
  const names = [...record.names.keys()];
  const nextValue = [initialValue, ...names].filter(Boolean).join(', ');

  if (nextValue) {
    anchor.style.setProperty('anchor-name', nextValue);
    return;
  }

  anchor.style.removeProperty('anchor-name');
}

export function acquireAnchorName(anchor: HTMLElement, name: string) {
  let record = records.get(anchor);

  if (!record) {
    record = {
      initialValue: anchor.style.getPropertyValue('anchor-name'),
      names: new Map(),
    };
    records.set(anchor, record);
  }

  record.names.set(name, (record.names.get(name) ?? 0) + 1);
  syncAnchorNames(anchor, record);

  let released = false;

  return () => {
    if (released) {
      return;
    }
    released = true;

    const currentRecord = records.get(anchor);
    if (currentRecord !== record) {
      return;
    }

    const count = currentRecord.names.get(name) ?? 0;
    if (count > 1) {
      currentRecord.names.set(name, count - 1);
      syncAnchorNames(anchor, currentRecord);
      return;
    }

    currentRecord.names.delete(name);

    if (currentRecord.names.size === 0) {
      if (normalizeAnchorNameValue(currentRecord.initialValue)) {
        anchor.style.setProperty('anchor-name', currentRecord.initialValue);
      } else {
        anchor.style.removeProperty('anchor-name');
      }
      records.delete(anchor);
      return;
    }

    syncAnchorNames(anchor, currentRecord);
  };
}
