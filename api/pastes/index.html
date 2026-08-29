import type { VercelRequest, VercelResponse } from "@vercel/node";
import { customAlphabet } from "nanoid";
import { getDb } from "../_lib/db";
import { getAuthPayload } from "../_lib/auth";
import { bodyOf } from "../_lib/body";

// Unambiguous alphabet (no 0/O/1/l/I) so ids are easy to read aloud/type.
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const genId = customAlphabet(ALPHABET, 8);
const genSecret = customAlphabet(ALPHABET, 24);

const EXPIRY_MS: Record<string, number | null> = {
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
  "1w": 7 * 24 * 60 * 60 * 1000,
  never: null,
};

const MAX_CONTENT_BYTES = 500_000; // 500 KB

interface PasteDoc {
  _id: string;
  title: string;
  content: string;
  language: string;
  ownerId: string | null;
  secret: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  views: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title, content, language, expiry } = bodyOf(req);

  if (typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ error: "Content is required" });
  }
  if (Buffer.byteLength(content, "utf8") > MAX_CONTENT_BYTES) {
    return res.status(413).json({ error: "Content too large (max 500 KB)" });
  }

  const expiryKey = typeof expiry === "string" && expiry in EXPIRY_MS ? expiry : "never";
  const ms = EXPIRY_MS[expiryKey];
  const expiresAt = ms !== null ? new Date(Date.now() + ms) : null;

  const auth = getAuthPayload(req);
  const id = genId();
  // Logged-in users own the paste via their account; anonymous authors
  // get a one-time secret instead, since there's no account to check against.
  const secret = auth ? null : genSecret();

  const db = await getDb();
  await db.collection<PasteDoc>("pastes").insertOne({
    _id: id,
    title: typeof title === "string" && title.trim() ? title.trim().slice(0, 200) : "Untitled paste",
    content,
    language: typeof language === "string" ? language : "plaintext",
    ownerId: auth?.userId ?? null,
    secret,
    expiresAt,
    createdAt: new Date(),
    views: 0,
  });

  return res.status(201).json({ id, secret });
}
