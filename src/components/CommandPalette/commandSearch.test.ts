import { expect, it } from 'vitest';
import { searchCommands } from './commandSearch';

const commands = [
  { id: 'alias', name: 'Write', keywords: ['Save'] },
  { id: 'partial', name: 'Autosave' },
  { id: 'prefix', name: 'Save as' },
  { id: 'file', name: 'Save', group: 'File' },
  { id: 'workspace', name: 'SAVE', group: 'Workspace' },
  { id: 'fuzzy', name: 'Set active view', keywords: ['相机视图'] },
];

it('browses in source order and ranks exact names and prefixes before weaker matches', () => {
  expect(searchCommands(commands, '  ')).toEqual(commands);
  const matches = searchCommands(commands, ' SaVe ').map(({ id }) => id);
  expect(matches.slice(0, 3)).toEqual(['file', 'workspace', 'prefix']);
  expect(matches.slice(3).sort()).toEqual(['alias', 'fuzzy', 'partial']);
});

it('matches ordered characters in names and keywords and omits unrelated commands', () => {
  expect(searchCommands(commands, 'sacv')).toEqual([commands[5]]);
  expect(searchCommands(commands, '相视')).toEqual([commands[5]]);
  expect(searchCommands(commands, '视相')).toEqual([]);
});
