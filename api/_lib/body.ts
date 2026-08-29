import type { VercelRequest } from "@vercel/node";

export function bodyOf(req: VercelRequest): Record<string, unknown> {
  const body = req.body;
  if (body && typeof body === "object") return body as Record<string, unknown>;
  return {};
}
