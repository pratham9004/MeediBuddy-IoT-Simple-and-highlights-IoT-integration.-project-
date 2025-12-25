// utils/daySlotMap.js
// Maps day+slot to cell id (cell1..cell21)
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOTS = ["Morning", "Afternoon", "Night"];

export function mapDaySlotToCell(day, slot) {
  const dayIndex = DAYS.indexOf(day); // 0..6
  const slotIndex = SLOTS.indexOf(slot); // 0..2
  if (dayIndex === -1 || slotIndex === -1) return null;
  const cellNumber = dayIndex * 3 + slotIndex + 1; // 1..21
  return `cell${cellNumber}`;
}

export function mapCellToDaySlot(cellId) {
  const match = cellId.match(/^cell(\d+)$/);
  if (!match) return null;
  const cellNumber = parseInt(match[1]) - 1; // 0..20
  const dayIndex = Math.floor(cellNumber / 3);
  const slotIndex = cellNumber % 3;
  return {
    day: DAYS[dayIndex],
    slot: SLOTS[slotIndex]
  };
}