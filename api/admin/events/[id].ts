import { deleteEvent, parseEventInput, updateEvent } from "../../_lib/events";
import { badRequest, json, methodNotAllowed, serverError } from "../../_lib/http";
import { requireAdmin } from "../../_lib/auth";

export const config = { runtime: "edge" };

function getEventId(req: Request) {
  const pathname = new URL(req.url).pathname;
  return pathname.split("/").filter(Boolean).pop() || "";
}

export default async function handler(req: Request): Promise<Response> {
  const authError = await requireAdmin(req);
  if (authError) {
    return authError;
  }

  const id = getEventId(req);
  if (!id) {
    return badRequest("Event id is required");
  }

  try {
    if (req.method === "PUT") {
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

      const event = await updateEvent(id, parsed.data);
      if (!event) {
        return json({ error: "Event not found" }, { status: 404 });
      }

      return json({ event });
    }

    if (req.method === "DELETE") {
      const deleted = await deleteEvent(id);
      if (!deleted) {
        return json({ error: "Event not found" }, { status: 404 });
      }

      return json({ success: true });
    }

    return methodNotAllowed();
  } catch (error) {
    console.error("Admin event mutation failed", error);
    return serverError("Failed to update event");
  }
}
