import {
  createInitialGameState,
  stepGameTick,
  RuneType,
  TrapOutRune,
  ENTRY_ROW,
  BOARD_COLS,
} from "../game";

function main() {
  console.log("RuneMages sandbox starting (dirty mana test)...");
  let state = createInitialGameState();

  // Добавим ловушку (TrapOut) для игрока 0 ближе к правому краю
  const p0 = state.players[0];
  const trap: TrapOutRune = {
    id: "trap_1",
    type: RuneType.TrapOut,
    position: { row: ENTRY_ROW, col: BOARD_COLS - 2 }, // за пару клеток до края
  };

  p0.board.runes.push(trap);
  state.players[0] = p0;

  console.log("\n=== Настройка ===");
  console.log(`Добавлена ловушка для игрока 0 на позиции (${ENTRY_ROW}, ${BOARD_COLS - 2})`);
  console.log("Ожидаем, что часть маны будет перехвачена и отправлена игроку 1 в следующей волне");
  console.log("");

  // Прогоняем достаточно тиков, чтобы точно пройти 2 волны
  for (let i = 0; i < 400; i++) {
    state = stepGameTick(state);

    // Промежуточный вывод каждые 50 тиков
    if (i % 50 === 0 && i > 0) {
      const p0State = state.players[0];
      const p1State = state.players[1];
      const wave0 = p0State.waves[0];
      const wave1 = p1State.waves[1];

      console.log(`Тик ${i}:`);
      console.log(
        `  P0 волна ${p0State.currentWaveIndex}: собрано=${p0State.board.pureManaCollected}, отправлено=${p0State.board.sentDirtyMana}`
      );
      if (wave0.finished) {
        console.log(
          `  P0 волна 0 завершена: scoreDelta=${wave0.scoreDelta}, sentDirty=${wave0.sentDirty}`
        );
      }
      if (wave1.finished) {
        console.log(
          `  P1 волна 1 завершена: incomingDirty=${wave1.config.incomingDirtyMana}`
        );
      }
    }
  }

  const p0State = state.players[0];
  const p1State = state.players[1];

  console.log("\n=== Итоговые результаты ===");
  console.log("P0 totalScore:", p0State.totalScore);
  console.log("P1 totalScore:", p1State.totalScore);
  console.log("");

  console.log("=== Статистика по волнам ===");
  for (let i = 0; i < 5; i++) {
    const p0Wave = p0State.waves[i];
    const p1Wave = p1State.waves[i];

    console.log(`Волна ${i}:`);
    console.log(
      `  P0: pure=${p0Wave.pureCollected}, dirty=${p0Wave.dirtyCollected}, sent=${p0Wave.sentDirty}, scoreDelta=${p0Wave.scoreDelta}`
    );
    console.log(
      `  P1: pure=${p1Wave.pureCollected}, dirty=${p1Wave.dirtyCollected}, sent=${p1Wave.sentDirty}, scoreDelta=${p1Wave.scoreDelta}`
    );

    if (i < 4) {
      console.log(
        `  P0 incomingDirty в волне ${i + 1}: ${p0State.waves[i + 1].config.incomingDirtyMana}`
      );
      console.log(
        `  P1 incomingDirty в волне ${i + 1}: ${p1State.waves[i + 1].config.incomingDirtyMana}`
      );
    }
    console.log("");
  }

  console.log("Match finished:", state.isMatchFinished);
}

main();
