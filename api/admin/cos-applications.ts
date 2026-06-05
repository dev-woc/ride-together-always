import { requireAdmin } from "../_lib/auth";
import { sql } from "../_lib/db";
import { json, methodNotAllowed, badRequest, serverError } from "../_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const id = url.searchParams.get("id");

  if (req.method === "GET") {
    try {
      const apps =
        status && status !== "all"
          ? await sql`
              SELECT a.*, u.name as user_name
              FROM cos_applications a
              JOIN cos_users u ON a.user_id = u.id
              WHERE a.status = ${status}
              ORDER BY a.submitted_at DESC
            `
          : await sql`
              SELECT a.*, u.name as user_name
              FROM cos_applications a
              JOIN cos_users u ON a.user_id = u.id
              ORDER BY a.submitted_at DESC
            `;
      return json({ applications: apps });
    } catch (error) {
      console.error("COS applications fetch failed", error);
      return serverError("Failed to fetch applications");
    }
  }

  if (req.method === "PATCH") {
    if (!id) return badRequest("id is required");
    try {
      const body = (await req.json()) as { status: string };
      const valid = ["pending", "reviewing", "approved", "rejected"];
      if (!valid.includes(body.status)) return badRequest("Invalid status");

      const [app] = await sql`
        UPDATE cos_applications
        SET status = ${body.status}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, status
      `;
      return json({ application: app });
    } catch (error) {
      console.error("COS application update failed", error);
      return serverError("Failed to update application");
    }
  }

  return methodNotAllowed();
}
