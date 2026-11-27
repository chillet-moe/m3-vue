export type CommandPaletteCommand = {
  /** Unique, stable identity across context updates. */
  id: string;
  /** Display name and primary search text. */
  name: string;
  keywords?: readonly string[];
  /** Category or path shown alongside the name. */
  group?: string;
  /** Material Symbol name. */
  icon?: string;
  /** Shortcut hint displayed in the result row. */
  shortcut?: string;
  disabled?: boolean;
};

function matchRank(text: string, query: string) {
  if (text === query) return 0;
  if (text.startsWith(query)) return 1;
  if (text.includes(query)) return 2;

  let from = 0;
  for (const letter of query) {
    const index = text.indexOf(letter, from);
    if (index < 0) return Infinity;
    from = index + letter.length;
  }
  return 3;
}

export function searchCommands(commands: readonly CommandPaletteCommand[], input: string, locale?: string) {
  const query = input.trim().toLocaleLowerCase(locale);
  if (!query) return commands;

  const matches: { command: CommandPaletteCommand; rank: number }[] = [];
  for (const command of commands) {
    let rank = matchRank(command.name.toLocaleLowerCase(locale), query);
    for (const keyword of command.keywords ?? []) {
      rank = Math.min(rank, 2 + matchRank(keyword.toLocaleLowerCase(locale), query));
    }
    if (Number.isFinite(rank)) matches.push({ command, rank });
  }
  return matches.sort((a, b) => a.rank - b.rank).map(({ command }) => command);
}
