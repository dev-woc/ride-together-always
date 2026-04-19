import { requireAdmin } from "../_lib/auth";
import { sql, ensureResourcesTable } from "../_lib/db";
import { badRequest, json, methodNotAllowed, serverError } from "../_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    await ensureResourcesTable();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM resources ORDER BY sort_order ASC, created_at ASC`;
      return json({ resources: rows });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => null);
      if (!body?.title || !body?.description || !body?.link) return badRequest("title, description, and link are required");
      const [row] = await sql`
        INSERT INTO resources (title, description, link, urgent, sort_order)
        VALUES (${body.title}, ${body.description}, ${body.link}, ${!!body.urgent}, ${body.sort_order ?? 0})
        RETURNING *
      `;
      return json({ resource: row });
    }

    if (req.method === "PUT") {
      if (!id) return badRequest("id is required");
      const body = await req.json().catch(() => null);
      if (!body?.title || !body?.description || !body?.link) return badRequest("title, description, and link are required");
      const [row] = await sql`
        UPDATE resources
        SET title = ${body.title}, description = ${body.description}, link = ${body.link},
            urgent = ${!!body.urgent}, sort_order = ${body.sort_order ?? 0}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      if (!row) return json({ error: "Not found" }, { status: 404 });
      return json({ resource: row });
    }

    if (req.method === "DELETE") {
      if (!id) return badRequest("id is required");
      await sql`DELETE FROM resources WHERE id = ${id}`;
      return json({ success: true });
    }

    return methodNotAllowed();
  } catch (error) {
    console.error("Admin resources request failed", error);
    return serverError("Failed to process resources request");
  }
}
