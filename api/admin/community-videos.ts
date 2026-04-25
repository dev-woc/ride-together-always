import { requireAdmin } from "../_lib/auth";
import { ensureCommunityVideosTable, sql } from "../_lib/db";
import { badRequest, json, methodNotAllowed, serverError } from "../_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await ensureCommunityVideosTable();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (req.method === "GET") {
      const videos = await sql`
        SELECT id, video_url, file_key, title, sort_order, created_at, updated_at
        FROM community_videos
        ORDER BY sort_order ASC, created_at ASC
      `;

      return json({ videos });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => null);

      if (!body?.video_url || !body?.file_key) {
        return badRequest("video_url and file_key are required");
      }

      const [video] = await sql`
        INSERT INTO community_videos (video_url, file_key, title, sort_order)
        VALUES (${body.video_url}, ${body.file_key}, ${body.title ?? ""}, ${body.sort_order ?? 0})
        RETURNING id, video_url, file_key, title, sort_order, created_at, updated_at
      `;

      return json({ video });
    }

    if (req.method === "DELETE") {
      if (!id) return badRequest("id is required");

      await sql`DELETE FROM community_videos WHERE id = ${id}`;
      return json({ success: true });
    }

    return methodNotAllowed();
  } catch (error) {
    console.error("Admin community videos request failed", error);
    return serverError("Failed to process community videos request");
  }
}
