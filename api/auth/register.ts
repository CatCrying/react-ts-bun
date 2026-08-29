import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";
import { hashPassword, signToken, authCookie } from "../_lib/auth";
import { bodyOf } from "../_lib/body";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = bodyOf(req);

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.trim().length < 3 ||
    username.trim().length > 32 ||
    password.length < 6
  ) {
    return res.status(400).json({
      error: "Username must be 3-32 characters and password at least 6 characters",
    });
  }

  const cleanUsername = username.trim();
  const db = await getDb();
  const users = db.collection("users");

  const existing = await users.findOne({ username: cleanUsername });
  if (existing) {
    return res.status(409).json({ error: "That username is already taken" });
  }

  const passwordHash = await hashPassword(password);
  const result = await users.insertOne({
    username: cleanUsername,
    passwordHash,
    createdAt: new Date(),
  });

  const token = signToken({ userId: result.insertedId.toString(), username: cleanUsername });
  res.setHeader("Set-Cookie", authCookie(token));
  return res.status(201).json({ username: cleanUsername });
}
