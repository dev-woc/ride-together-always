import { badRequest, unauthorized } from "./http";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || "";
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function toBase64Url(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function signValue(value: string) {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET or JWT_SECRET is required");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  return toBase64Url(signature);
}

function parseCookies(req: Request) {
  const header = req.headers.get("cookie") || "";
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName) {
      return acc;
    }

    acc[rawName] = decodeURIComponent(rawValue.join("="));
    return acc;
  }, {});
}

function isSecureRequest(req: Request) {
  return new URL(req.url).protocol === "https:";
}

export async function createSessionCookie(req: Request) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${expiresAt}`;
  const signature = await signValue(payload);
  const token = `${expiresAt}.${signature}`;
  const secure = isSecureRequest(req) ? "; Secure" : "";

  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}${secure}`;
}

export function clearSessionCookie(req: Request) {
  const secure = isSecureRequest(req) ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export async function isAdminAuthenticated(req: Request) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];

  if (!token) {
    return false;
  }

  const [expiresAtRaw, signature] = token.split(".");
  const expiresAt = Number(expiresAtRaw);

  if (!expiresAt || !signature || Date.now() > expiresAt) {
    return false;
  }

  const expectedSignature = await signValue(`admin:${expiresAt}`);
  return signature === expectedSignature;
}

export async function requireAdmin(req: Request) {
  if (!(await isAdminAuthenticated(req))) {
    return unauthorized();
  }

  return null;
}

export async function parseAdminLogin(req: Request) {
  let body: { password?: string };

  try {
    body = await req.json();
  } catch {
    return { error: badRequest("Invalid JSON") };
  }

  if (!body.password) {
    return { error: badRequest("Password is required") };
  }

  return { password: body.password };
}
