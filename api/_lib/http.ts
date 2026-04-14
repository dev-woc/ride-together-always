export const jsonHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

export function methodNotAllowed() {
  return json({ error: "Method not allowed" }, { status: 405 });
}

export function unauthorized(message = "Unauthorized") {
  return json({ error: message }, { status: 401 });
}

export function badRequest(message: string) {
  return json({ error: message }, { status: 400 });
}

export function serverError(message = "Internal server error") {
  return json({ error: message }, { status: 500 });
}
