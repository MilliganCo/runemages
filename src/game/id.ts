let manaIdCounter = 0;
let runeIdCounter = 0;

export function nextManaId(): string {
  manaIdCounter += 1;
  return `mana_${manaIdCounter}`;
}

export function nextRuneId(): string {
  runeIdCounter += 1;
  return `rune_${runeIdCounter}`;
}

