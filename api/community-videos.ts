import { ensureCommunityVideosTable, sql } from "./_lib/db";
import { badRequest, json, methodNotAllowed, serverError } from "./_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  await ensureCommunityVideosTable();

  if (req.method === "GET") {
    try {
      const videos = await sql`
        SELECT id, video_url, file_key, title, sort_order, created_at, updated_at
        FROM community_videos
        ORDER BY sort_order ASC, created_at ASC
      `;
      return json({ videos });
    } catch (error) {
      console.error("Community videos fetch failed", error);
      return serverError("Failed to fetch community videos");
    }
  }

  if (req.method === "POST") {
    try {
      const body = await req.json().catch(() => null);
      if (!body?.video_url || !body?.file_key) {
        return badRequest("video_url and file_key are required");
      }

      const [video] = await sql`
        INSERT INTO community_videos (video_url, file_key, title, sort_order)
        VALUES (
          ${body.video_url},
          ${body.file_key},
          ${(body.title ?? "").slice(0, 120)},
          0
        )
        RETURNING id, video_url, file_key, title, sort_order, created_at, updated_at
      `;
      return json({ video }, { status: 201 });
    } catch (error) {
      console.error("Community video submission failed", error);
      return serverError("Failed to save video");
    }
  }

  return methodNotAllowed();
}
