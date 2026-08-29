const STORAGE_KEY = "pastebin.secrets";

function readAll(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function rememberSecret(pasteId: string, secret: string): void {
  const all = readAll();
  all[pasteId] = secret;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getRememberedSecret(pasteId: string): string | null {
  return readAll()[pasteId] ?? null;
}

export function forgetSecret(pasteId: string): void {
  const all = readAll();
  delete all[pasteId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
