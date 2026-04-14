import { isAdminAuthenticated } from "../_lib/auth";
import { json, methodNotAllowed } from "../_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return methodNotAllowed();
  }

  return json({ authenticated: await isAdminAuthenticated(req) });
}
