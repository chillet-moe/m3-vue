type AnchorNameRecord = {
  initialValue: string;
  names: string | Map<string, number>;
};

const records = new WeakMap<HTMLElement, AnchorNameRecord>();

function normalizeAnchorNameValue(value: string) {
  const trimmed = value.trim();
  return trimmed && trimmed !== 'none' ? trimmed : '';
}

function syncAnchorNames(anchor: HTMLElement, record: AnchorNameRecord) {
  let nextValue = normalizeAnchorNameValue(record.initialValue);
  const names = record.names;
  if (typeof names === 'string') {
    if (names) nextValue = nextValue ? `${nextValue}, ${names}` : names;
  } else {
    for (const name of names.keys()) {
      if (!name) continue;
      nextValue = nextValue ? `${nextValue}, ${name}` : name;
    }
  }

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
      names: name,
    };
    records.set(anchor, record);
  } else {
    // Only overlapping acquisitions need a map and per-name reference counts.
    if (typeof record.names === 'string') record.names = new Map<string, number>().set(record.names, 1);
    record.names.set(name, (record.names.get(name) ?? 0) + 1);
  }

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

    const names = currentRecord.names;
    if (typeof names !== 'string') {
      const count = names.get(name) ?? 0;
      if (count > 1) names.set(name, count - 1);
      else names.delete(name);
      if (names.size) {
        syncAnchorNames(anchor, currentRecord);
        return;
      }
    }

    // Retire this record before a custom element can acquire again during the style write.
    records.delete(anchor);
    if (normalizeAnchorNameValue(currentRecord.initialValue)) {
      anchor.style.setProperty('anchor-name', currentRecord.initialValue);
    } else {
      anchor.style.removeProperty('anchor-name');
    }
  };
}
