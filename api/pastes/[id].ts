import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_lib/db";
import { getAuthPayload } from "../_lib/auth";
import { bodyOf } from "../_lib/body";

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
  const id = req.query.id;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid paste id" });
  }

  const db = await getDb();
  const pastes = db.collection<PasteDoc>("pastes");

  if (req.method === "GET") {
    const paste = await pastes.findOne({ _id: id });
    if (!paste || (paste.expiresAt && paste.expiresAt.getTime() < Date.now())) {
      return res.status(404).json({ error: "Paste not found or expired" });
    }
    const result = await pastes.findOneAndUpdate(
      { _id: id },
      { $inc: { views: 1 } },
      { returnDocument: "after" },
    );
    const views = result?.views ?? paste.views + 1;

    return res.status(200).json({
      id: paste._id,
      title: paste.title,
      content: paste.content,
      language: paste.language,
      createdAt: paste.createdAt,
      expiresAt: paste.expiresAt,
      views,
      isOwnedByAccount: paste.ownerId !== null,
    });
  }

  // PUT and DELETE both require proving ownership first.
  const paste = await pastes.findOne({ _id: id });
  if (!paste) {
    return res.status(404).json({ error: "Paste not found" });
  }

  const auth = getAuthPayload(req);
  const { secret } = bodyOf(req);

  const isOwner =
    (paste.ownerId !== null && auth !== null && paste.ownerId === auth.userId) ||
    (paste.ownerId === null && paste.secret !== null && secret === paste.secret);

  if (!isOwner) {
    return res.status(403).json({ error: "You don't have permission to modify this paste" });
  }

  if (req.method === "DELETE") {
    await pastes.deleteOne({ _id: id });
    return res.status(204).end();
  }

  if (req.method === "PUT") {
    const { content, title, language } = bodyOf(req);
    const update: Partial<Pick<PasteDoc, "content" | "title" | "language">> = {};
    if (typeof content === "string" && content.trim().length > 0) update.content = content;
    if (typeof title === "string") update.title = title.trim().slice(0, 200);
    if (typeof language === "string") update.language = language;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    await pastes.updateOne({ _id: id }, { $set: update });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
