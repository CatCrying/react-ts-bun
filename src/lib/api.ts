export interface PasteCreateResponse {
  id: string;
  secret: string | null;
}

export interface PasteView {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: string;
  expiresAt: string | null;
  views: number;
  isOwnedByAccount: boolean;
}

export interface AuthUser {
  username: string;
}

export interface MyPasteSummary {
  _id: string;
  title: string;
  language: string;
  createdAt: string;
  expiresAt: string | null;
  views: number;
}

async function parseJson<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (body as { error?: string }).error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

function post(path: string, body: unknown) {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
}

export function createPaste(input: {
  title: string;
  content: string;
  language: string;
  expiry: string;
}): Promise<PasteCreateResponse> {
  return post("/api/pastes", input).then((r) => parseJson<PasteCreateResponse>(r));
}

export function getPaste(id: string): Promise<PasteView> {
  return fetch(`/api/pastes/${id}`, { credentials: "include" }).then((r) => parseJson<PasteView>(r));
}

export async function deletePaste(id: string, secret: string | null): Promise<void> {
  const res = await fetch(`/api/pastes/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ secret }),
  });
  if (!res.ok && res.status !== 204) {
    await parseJson(res);
  }
}

export function register(username: string, password: string): Promise<AuthUser> {
  return post("/api/auth/register", { username, password }).then((r) => parseJson<AuthUser>(r));
}

export function login(username: string, password: string): Promise<AuthUser> {
  return post("/api/auth/login", { username, password }).then((r) => parseJson<AuthUser>(r));
}

export function logout(): Promise<void> {
  return fetch("/api/auth/logout", { method: "POST", credentials: "include" }).then(() => undefined);
}

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  return parseJson<AuthUser>(res);
}

export function fetchMyPastes(): Promise<{ pastes: MyPasteSummary[] }> {
  return fetch("/api/pastes/mine", { credentials: "include" }).then((r) =>
    parseJson<{ pastes: MyPasteSummary[] }>(r),
  );
}
