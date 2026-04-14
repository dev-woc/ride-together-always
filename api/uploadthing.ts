import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRouteHandler } from 'uploadthing/server';
import { ourFileRouter } from '../src/lib/uploadthing';

const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: { token: process.env.UPLOADTHING_TOKEN! },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Bridge Vercel's req/res to the fetch-based UploadThing handler
  const url = new URL(req.url ?? '/', `https://${req.headers.host}`);
  const fetchReq = new Request(url, {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: ['POST', 'PUT', 'PATCH'].includes(req.method ?? '') ? JSON.stringify(req.body) : undefined,
  });

  const fetchRes = req.method === 'GET' ? await GET(fetchReq) : await POST(fetchReq);

  res.status(fetchRes.status);
  fetchRes.headers.forEach((value, key) => res.setHeader(key, value));
  const body = await fetchRes.text();
  res.send(body);
}
