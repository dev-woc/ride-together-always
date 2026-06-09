import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRouteHandler } from 'uploadthing/server';
import { ourFileRouter } from '../src/lib/uploadthing-router.js';

export const config = { api: { bodyParser: false } };

let _handler: ((req: Request) => Promise<Response>) | null = null;

function getHandler() {
  if (!_handler) {
    const token = process.env.UPLOADTHING_TOKEN;
    if (!token) throw new Error('UPLOADTHING_TOKEN is not set');
    _handler = createRouteHandler({ router: ourFileRouter, config: { token } });
  }
  return _handler;
}

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const utHandler = getHandler();

    const proto = (req.headers['x-forwarded-proto'] as string) ?? 'https';
    const host = req.headers.host ?? 'localhost';
    const url = `${proto}://${host}${req.url ?? '/api/uploadthing'}`;

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined) continue;
      headers[key] = Array.isArray(value) ? value.join(', ') : value;
    }

    const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method ?? '');
    const body = hasBody ? await readRawBody(req) : undefined;

    const fetchReq = new Request(url, { method: req.method ?? 'GET', headers, body });
    const fetchRes = await utHandler(fetchReq);
    const text = await fetchRes.text();

    if (fetchRes.status >= 400) {
      console.error(`[uploadthing] ${fetchRes.status}:`, text);
    }

    // Only forward safe headers — avoid forwarding Transfer-Encoding or other
    // headers that can conflict with Vercel's Node.js HTTP response handling.
    const forwardHeaders = ['content-type', 'cache-control', 'x-uploadthing-version'];
    for (const name of forwardHeaders) {
      const val = fetchRes.headers.get(name);
      if (val) res.setHeader(name, val);
    }

    res.status(fetchRes.status).send(text);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[uploadthing] error:', message);
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
}
