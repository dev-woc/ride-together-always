import { ensureCommunityVideosTable, sql } from "./_lib/db";
import { json, methodNotAllowed, serverError } from "./_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") return methodNotAllowed();

  try {
    await ensureCommunityVideosTable();
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
