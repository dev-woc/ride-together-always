import { createEvent, listEvents, parseEventInput } from "../_lib/events";
import { badRequest, json, methodNotAllowed, serverError } from "../_lib/http";
import { requireAdmin } from "../_lib/auth";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const authError = await requireAdmin(req);
  if (authError) {
    return authError;
  }

  try {
    if (req.method === "GET") {
      const events = await listEvents();
      return json({ events });
    }

    if (req.method === "POST") {
      let body: unknown;

      try {
        body = await req.json();
      } catch {
        return badRequest("Invalid JSON");
      }

      const parsed = parseEventInput(body);
      if (!parsed.success) {
        return badRequest("Invalid event payload");
      }

      const event = await createEvent(parsed.data);
      return json({ event }, { status: 201 });
    }

    return methodNotAllowed();
  } catch (error) {
    console.error("Admin events request failed", error);
    return serverError("Failed to process event request");
  }
}
