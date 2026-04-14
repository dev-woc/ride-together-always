import { listSiteContent } from "./_lib/site-content";
import { json, methodNotAllowed, serverError } from "./_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return methodNotAllowed();
  }

  try {
    const rows = await listSiteContent();
    const content = rows.reduce<Record<string, unknown>>((acc, row) => {
      acc[row.key] = row.value_json;
      return acc;
    }, {});

    return json({ content });
  } catch (error) {
    console.error("Failed to load site content", error);
    return serverError("Failed to load site content");
  }
}
