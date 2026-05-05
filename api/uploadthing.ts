import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRouteHandler } from 'uploadthing/server';
import { ourFileRouter } from '../src/lib/uploadthing-router.js';

const handler = createRouteHandler({
  router: ourFileRouter,
  config: { token: process.env.UPLOADTHING_TOKEN! },
});

// Vercel auto-parses the body before our handler runs, consuming the stream.
// Re-stringifying req.body can produce a different byte sequence than the
// original, breaking UploadThing's request signature verification. Instead we
// buffer the raw bytes ourselves before Vercel touches them by setting
// bodyParser: false, then forward an unmodified body to UploadThing.
export const config = { api: { bodyParser: false } };

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer | string) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    );
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function (req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url ?? '/', `https://${req.headers.host ?? 'localhost'}`);

  // Normalise headers: join multi-value arrays, drop undefined entries.
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    headers[key] = Array.isArray(value) ? value.join(', ') : value;
  }

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method ?? '');
  const rawBody = hasBody ? await readRawBody(req) : undefined;

  const fetchReq = new Request(url.toString(), {
    method: req.method ?? 'GET',
    headers,
    body: rawBody,
  });

  const fetchRes = await handler(fetchReq);

  res.status(fetchRes.status);
  fetchRes.headers.forEach((value, key) => res.setHeader(key, value));
  res.send(await fetchRes.text());
}
