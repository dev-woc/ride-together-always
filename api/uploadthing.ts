import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRouteHandler } from 'uploadthing/server';
import { ourFileRouter } from '../src/lib/uploadthing-router.js';

const handler = createRouteHandler({
  router: ourFileRouter,
  config: { token: process.env.UPLOADTHING_TOKEN! },
});

export default async function (req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url ?? '/', `https://${req.headers.host ?? 'localhost'}`);
  const body = req.body ? JSON.stringify(req.body) : undefined;

  const fetchReq = new Request(url.toString(), {
    method: req.method ?? 'GET',
    headers: req.headers as HeadersInit,
    body: ['POST', 'PUT', 'PATCH'].includes(req.method ?? '') ? body : undefined,
  });

  const fetchRes = await handler(fetchReq);

  res.status(fetchRes.status);
  fetchRes.headers.forEach((value, key) => res.setHeader(key, value));
  res.send(await fetchRes.text());
}
