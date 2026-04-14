import { requireAdmin } from "../_lib/auth";
import { badRequest, json, methodNotAllowed, serverError } from "../_lib/http";
import { listSiteContent, parseSiteContentSection, upsertSiteContent } from "../_lib/site-content";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const authError = await requireAdmin(req);
  if (authError) {
    return authError;
  }

  try {
    if (req.method === "GET") {
      const rows = await listSiteContent();
      const content = rows.reduce<Record<string, unknown>>((acc, row) => {
        acc[row.key] = row.value_json;
        return acc;
      }, {});

      return json({ content });
    }

    if (req.method === "PUT") {
      let body: unknown;

      try {
        body = await req.json();
      } catch {
        return badRequest("Invalid JSON");
      }

      const parsed = parseSiteContentSection(body);
      if (!parsed.success) {
        return badRequest("Invalid site content payload");
      }

      const row = await upsertSiteContent(parsed.data.key, parsed.data.value);
      return json({ item: row });
    }

    return methodNotAllowed();
  } catch (error) {
    console.error("Admin site content request failed", error);
    return serverError("Failed to process site content request");
  }
}
