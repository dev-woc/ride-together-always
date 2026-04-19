import { sql, ensureResourcesTable } from "./_lib/db";
import { json, methodNotAllowed, serverError } from "./_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") return methodNotAllowed();

  try {
    await ensureResourcesTable();
    const rows = await sql`SELECT * FROM resources ORDER BY sort_order ASC, created_at ASC`;
    return json({ resources: rows });
  } catch (error) {
    console.error("Resources fetch failed", error);
    return serverError("Failed to fetch resources");
  }
}
