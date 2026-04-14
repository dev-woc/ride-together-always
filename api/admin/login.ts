import { createSessionCookie, getAdminPassword, parseAdminLogin } from "../_lib/auth";
import { json, methodNotAllowed, serverError, unauthorized } from "../_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return methodNotAllowed();
  }

  try {
    const parsed = await parseAdminLogin(req);

    if ("error" in parsed) {
      return parsed.error;
    }

    const configuredPassword = getAdminPassword();

    if (!configuredPassword) {
      return serverError("ADMIN_PASSWORD is not configured");
    }

    if (parsed.password !== configuredPassword) {
      return unauthorized("Invalid password");
    }

    const sessionCookie = await createSessionCookie(req);

    return json(
      { authenticated: true },
      {
        headers: {
          "Set-Cookie": sessionCookie,
        },
      }
    );
  } catch (error) {
    console.error("Admin login failed", error);
    return serverError("Login failed");
  }
}
