import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuthPayload } from "../_lib/auth";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const payload = getAuthPayload(req);
  if (!payload) {
    return res.status(401).json({ error: "Not logged in" });
  }
  return res.status(200).json({ username: payload.username });
}
