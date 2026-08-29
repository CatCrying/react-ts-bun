import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";
import { getAuthPayload } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = getAuthPayload(req);
  if (!auth) {
    return res.status(401).json({ error: "Login required" });
  }

  const db = await getDb();
  const pastes = await db
    .collection("pastes")
    .find({ ownerId: auth.userId })
    .project({ content: 0, secret: 0 })
    .sort({ createdAt: -1 })
    .toArray();

  return res.status(200).json({ pastes });
}
