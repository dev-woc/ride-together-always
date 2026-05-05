import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRouteHandler } from 'uploadthing/server';
import { ourFileRouter } from '../src/lib/uploadthing-router.js';

if (!process.env.UPLOADTHING_TOKEN) {
  console.error('[uploadthing] UPLOADTHING_TOKEN is not set — all uploads will fail');
}

const handler = createRouteHandler({
  router: ourFileRouter,
  config: { token: process.env.UPLOADTHING_TOKEN ?? '' },
});

// bodyParser: false so Vercel does not consume the request stream before we
// forward the raw bytes to UploadThing. UploadThing verifies the raw body
// digest, so re-serialising req.body would break signature checks.
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
  if (!process.env.UPLOADTHING_TOKEN) {
    res.status(500).json({ error: 'UPLOADTHING_TOKEN environment variable is not set' });
    return;
  }

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

  try {
    const fetchRes = await handler(fetchReq);
    const responseText = await fetchRes.text();

    if (fetchRes.status >= 400) {
      console.error(`[uploadthing] ${fetchRes.status} response:`, responseText);
    }

    res.status(fetchRes.status);
    fetchRes.headers.forEach((value, key) => res.setHeader(key, value));
    res.send(responseText);
  } catch (err) {
    console.error('[uploadthing] handler threw:', err);
    res.status(500).json({ error: 'Upload handler error' });
  }
}
