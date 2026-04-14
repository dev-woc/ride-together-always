import { listEvents } from "./_lib/events";
import { json, methodNotAllowed, serverError } from "./_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return methodNotAllowed();
  }

  try {
    const events = await listEvents();
    return json({ events });
  } catch (error) {
    console.error("Failed to load public events", error);
    return serverError("Failed to load events");
  }
}
