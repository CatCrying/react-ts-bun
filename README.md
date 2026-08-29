# pastebin

React + TypeScript frontend (Bun-bundled) with Vercel serverless functions
as a proxy API in front of MongoDB. No backend framework — just plain
`api/*.ts` files, each one its own function.

## Stack

- `bun@1.4.0` — bundles the frontend via `build.ts` (React Compiler + Tailwind v4)
- `api/` — Vercel serverless functions (Node.js runtime), the proxy layer between
  the browser and MongoDB
- `mongodb` driver with a cached connection (reused across warm invocations)
- `jsonwebtoken` + `bcryptjs` for account auth (httpOnly cookie, no session store)
- `highlight.js` (core + a curated language subset) for syntax highlighting

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
cp .env.example .env.local   # fill in MONGODB_URI and JWT_SECRET
bunx tsc --noEmit             # typecheck (frontend + api together)
```

### One-time MongoDB indexes

Run this once against your database (via `mongosh` or Atlas's UI):

```js
db.users.createIndex({ username: 1 }, { unique: true });
db.pastes.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.pastes.createIndex({ ownerId: 1 });
```

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
2. In Project Settings → Environment Variables, add `MONGODB_URI` and
   `JWT_SECRET`.
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
