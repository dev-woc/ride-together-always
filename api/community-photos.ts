import { ensureCommunityPhotosTable, sql } from "./_lib/db";
import { json, methodNotAllowed, serverError } from "./_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") return methodNotAllowed();

  try {
    await ensureCommunityPhotosTable();
    const photos = await sql`
      SELECT id, image_url, file_key, alt_text, sort_order, created_at, updated_at
      FROM community_photos
      ORDER BY sort_order ASC, created_at ASC
    `;

    return json({ photos });
  } catch (error) {
    console.error("Community photos fetch failed", error);
    return serverError("Failed to fetch community photos");
  }
}
