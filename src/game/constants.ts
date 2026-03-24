// Размеры поля
export const BOARD_ROWS = 4;
export const BOARD_COLS = 8;

// Тайминги
export const TICKS_PER_SECOND = 10;
export const MAX_MANA_LIFETIME_TICKS = 40;

// Волны
export const BASE_MANA_PER_WAVE = 20;
export const MANA_SPAWN_INTERVAL_TICKS = 2;
export const WAVES_PER_MATCH = 5;

// Фазы
export const PREP_PHASE_SECONDS = 8;
// В будущем: FLOW_PHASE_SECONDS_MIN / MAX, пока можно одну константу
export const FLOW_PHASE_SECONDS = 12;

// Фазы в тиках
export const PREP_PHASE_TICKS = PREP_PHASE_SECONDS * TICKS_PER_SECOND;
export const FLOW_PHASE_TICKS = FLOW_PHASE_SECONDS * TICKS_PER_SECOND;

// Кулдаун редактирования в фазе Flow
export const EDIT_ACTION_COOLDOWN_SECONDS = 3;
export const EDIT_ACTION_COOLDOWN_TICKS =
  EDIT_ACTION_COOLDOWN_SECONDS * TICKS_PER_SECOND;

// Лимиты рун (пока как пример, позже можно вынести в конфиг на волну/матч)
export const MAX_RUNE_ARROWS = 8;
export const MAX_RUNE_MIRRORS = 4;
export const MAX_RUNE_SPLITTERS = 3;
export const MAX_RUNE_ACCELERATORS = 3;
export const MAX_RUNE_TRAPS = 3;

// Точка входа маны
export const ENTRY_ROW = Math.floor((BOARD_ROWS - 1) / 2); // "центр" по высоте
export const ENTRY_COL = 0;

