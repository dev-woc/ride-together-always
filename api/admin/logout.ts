import { clearSessionCookie } from "../_lib/auth";
import { json, methodNotAllowed } from "../_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return methodNotAllowed();
  }

  return json(
    { authenticated: false },
    {
      headers: {
        "Set-Cookie": clearSessionCookie(req),
      },
    }
  );
}
