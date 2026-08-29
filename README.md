# pastebin

React + TypeScript frontend (Bun-bundled) with Vercel serverless functions
as a proxy API in front of MongoDB. No backend framework — just plain
`api/*.ts` files, each one its own function.

## Stack

- `bun@1.4.0` — bundles the frontend via `build.ts` (React Compiler + Tailwind v4)
- `api/` — Vercel serverless functions (Node.js runtime), the proxy layer between
  the browser and the database
- `api/_lib/store/` — a `Store` interface with four interchangeable
  backends, picked at runtime via `DB_MODE`:

  | `DB_MODE` | Driver | Env var(s) | Notes |
  |---|---|---|---|
  | `mongodb` (default) | `mongodb` | `MONGODB_URI` | Real TTL index does expiry cleanup |
  | `sqlite` | `better-sqlite3` | `SQLITE_PATH` | **Local dev only** — see caveat below |
  | `postgres` | `pg` | `POSTGRES_URL` (or `DATABASE_URL`) | Tables auto-created on first request |
  | `mysql` | `mysql2` | `MYSQL_URL` (or `DATABASE_URL`) | Tables auto-created on first request |

  Route handlers (`api/pastes/*.ts`, `api/auth/*.ts`) only ever call
  `getStore()` — they never import a driver directly, so switching modes is
  a one-line env var change, not a code change. Each driver is dynamically
  `import()`-ed only when its mode is selected, so e.g. running with
  `DB_MODE=mongodb` never loads `pg`/`mysql2`/`better-sqlite3` at all.
- `jsonwebtoken` + `bcryptjs` for account auth (httpOnly cookie, no session store)
- `highlight.js` (core + a curated language subset) for syntax highlighting

### SQLite caveat

`better-sqlite3`'s native binding isn't supported when run directly under
the **Bun** runtime (a current Bun limitation, not a bug in this code) — but
that's fine here, because `bun` is only ever used to bundle the *frontend*
(`build.ts`). The `/api` functions always run on Vercel's **Node.js**
runtime, where `better-sqlite3` works normally (verified locally with
`node --experimental-strip-types`). The one thing that doesn't work is
`bunx vercel dev` invoking the SQLite path through Bun directly if Vercel
ever routes it that way locally — if you hit that, test the `sqlite` mode
with plain `node`/`vercel dev`'s Node function runner instead. Also worth
repeating: SQLite writes to a local file, which Vercel's serverless
functions don't persist or share across invocations — treat `sqlite` mode
as **local development only**, not a production option there.

## How ownership works

- **Logged in**: paste is tied to your account (`ownerId`). Edit/delete checked
  against your JWT cookie — no extra secret needed.
- **Anonymous**: paste gets a random secret returned once at creation time.
  The frontend stores it in `localStorage` so the delete button works from the
  same browser; anyone with the secret can also delete it via the API directly.

Expiration (`1h` / `1d` / `1w` / `never`) is enforced two ways: a MongoDB TTL
index does the actual cleanup, and `GET /api/pastes/:id` also checks
`expiresAt` itself so a paste never appears to be viewable in the (up to ~60s)
window before the TTL monitor sweeps it.

## Local setup

```bash
bun install
cp .env.example .env.local   # set DB_MODE, JWT_SECRET, and that mode's connection var
bunx tsc --noEmit             # typecheck (frontend + api together)
```

### One-time database setup

**mongodb**: run once via `mongosh` or Atlas's UI:

```js
db.users.createIndex({ username: 1 }, { unique: true });
db.pastes.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.pastes.createIndex({ ownerId: 1 });
```

**postgres** / **mysql** / **sqlite**: nothing to do — `getStore()` creates
the `users` and `pastes` tables (with the needed indexes) automatically on
first use if they don't already exist.

### Running locally

`vercel dev` is the easiest way to run both the static frontend and the
`/api` functions together with one command:

```bash
bunx vercel dev
```

(Building the frontend yourself with `bun run build` also works, but you'd
need something else serving `/api` locally — `vercel dev` handles both.)

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. In Project Settings → Environment Variables, add `JWT_SECRET`, `DB_MODE`,
   and whichever connection var that mode needs (`MONGODB_URI`,
   `POSTGRES_URL`, or `MYSQL_URL` — not `sqlite`, see the caveat above).
3. Deploy — `vercel.json` already points the build at `bun run build` /
   `dist`, and rewrites everything except `/api/*` to `index.html` for
   client-side routing.

## API reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/pastes` | optional | Create a paste. Returns `{ id, secret }` (`secret` is `null` if logged in). |
| GET | `/api/pastes/:id` | none | Fetch a paste, increments view count. |
| PUT | `/api/pastes/:id` | owner (cookie or `{ secret }` in body) | Update title/content/language. |
| DELETE | `/api/pastes/:id` | owner (cookie or `{ secret }` in body) | Delete a paste. |
| GET | `/api/pastes/mine` | required | List the logged-in user's pastes. |
| POST | `/api/auth/register` | — | Create an account, sets auth cookie. |
| POST | `/api/auth/login` | — | Log in, sets auth cookie. |
| POST | `/api/auth/logout` | — | Clears the auth cookie. |
| GET | `/api/auth/me` | required | Current logged-in username. |
