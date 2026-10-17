export const MAX_AMOUNT_CENTS = 999_999_999_999;
export const STORAGE_KEY = "debt.records.v1";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseAmount(value) {
  const normalized = String(value).trim().replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Укажите сумму числом, например 1 500,50.");
  }
  const [rubles, kopecks = ""] = normalized.split(".");
  const cents = Number(rubles) * 100 + Number(kopecks.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > MAX_AMOUNT_CENTS) {
    throw new Error("Сумма должна быть от 0,01 до 9 999 999 999,99 ₽.");
  }
  return cents;
}

export function amountForInput(cents) {
  return `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, "0")}`;
}

export function formatAmount(cents) {
  const exact = BigInt(cents);
  const rubles = new Intl.NumberFormat("ru-RU").format(exact / 100n);
  const kopecks = exact % 100n;
  return `${rubles}${kopecks ? "," + String(kopecks).padStart(2, "0") : ""}\u00a0₽`;
}

export function validateRecord(record) {
  if (!record || typeof record !== "object" || !uuidPattern.test(record.id) ||
      !["me", "i"].includes(record.direction) ||
      typeof record.title !== "string" || !record.title.trim() || record.title.length > 120 ||
      typeof record.person !== "string" || !record.person.trim() || record.person.length > 120 ||
      !Number.isSafeInteger(record.amount_cents) || record.amount_cents <= 0 || record.amount_cents > MAX_AMOUNT_CENTS ||
      typeof record.created_at !== "string" || !Number.isFinite(Date.parse(record.created_at))) {
    throw new Error("В копии есть некорректная запись. Исходные данные не изменены.");
  }
  return { id: record.id, direction: record.direction, title: record.title.trim(), person: record.person.trim(), amount_cents: record.amount_cents, created_at: record.created_at };
}

export function validateRecords(records) {
  if (!Array.isArray(records) || records.length > 10_000) throw new Error("Нужен список не более чем из 10 000 записей.");
  const checked = records.map(validateRecord);
  if (new Set(checked.map(record => record.id)).size !== checked.length) throw new Error("В копии повторяются идентификаторы записей.");
  return checked;
}

export function parseBackup(text) {
  let backup;
  try { backup = JSON.parse(text); } catch { throw new Error("Не удалось прочитать JSON. Выберите копию, скачанную из заметки."); }
  if (backup?.version !== 1) throw new Error("Этот формат копии не поддерживается.");
  return validateRecords(backup.records);
}

export function sortRecords(records) {
  return [...records].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || a.id.localeCompare(b.id));
}

export function countLabel(count) {
  if (!count) return "Нет записей";
  const last = count % 10;
  const teen = count % 100 >= 11 && count % 100 <= 14;
  return `${count} ${!teen && last === 1 ? "запись" : !teen && last >= 2 && last <= 4 ? "записи" : "записей"}`;
}
