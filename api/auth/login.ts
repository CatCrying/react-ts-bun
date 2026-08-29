import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";
import { comparePassword, signToken, authCookie } from "../_lib/auth";
import { bodyOf } from "../_lib/body";

interface UserDoc {
  username: string;
  passwordHash: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = bodyOf(req);
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const db = await getDb();
  const user = await db.collection<UserDoc>("users").findOne({ username: username.trim() });
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = signToken({ userId: user._id.toString(), username: user.username });
  res.setHeader("Set-Cookie", authCookie(token));
  return res.status(200).json({ username: user.username });
}
