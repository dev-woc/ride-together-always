import { requireAdmin } from "../_lib/auth";
import { ensureCommunityPhotosTable, sql } from "../_lib/db";
import { badRequest, json, methodNotAllowed, serverError } from "../_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await ensureCommunityPhotosTable();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (req.method === "GET") {
      const photos = await sql`
        SELECT id, image_url, file_key, alt_text, sort_order, created_at, updated_at
        FROM community_photos
        ORDER BY sort_order ASC, created_at ASC
      `;

      return json({ photos });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => null);

      if (!body?.image_url || !body?.file_key) {
        return badRequest("image_url and file_key are required");
      }

      const [photo] = await sql`
        INSERT INTO community_photos (image_url, file_key, alt_text, sort_order)
        VALUES (${body.image_url}, ${body.file_key}, ${body.alt_text ?? ""}, ${body.sort_order ?? 0})
        RETURNING id, image_url, file_key, alt_text, sort_order, created_at, updated_at
      `;

      return json({ photo });
    }

    if (req.method === "DELETE") {
      if (!id) return badRequest("id is required");

      await sql`DELETE FROM community_photos WHERE id = ${id}`;
      return json({ success: true });
    }

    return methodNotAllowed();
  } catch (error) {
    console.error("Admin community photos request failed", error);
    return serverError("Failed to process community photos request");
  }
}
