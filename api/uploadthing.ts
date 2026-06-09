import { createRouteHandler } from 'uploadthing/server';
import { ourFileRouter } from './_lib/uploadthing-router.js';

export const config = { runtime: 'edge' };

const handler = createRouteHandler({
  router: ourFileRouter,
  config: { token: process.env.UPLOADTHING_TOKEN ?? '' },
});

export default function (req: Request): Promise<Response> {
  if (!process.env.UPLOADTHING_TOKEN) {
    return Promise.resolve(
      new Response(JSON.stringify({ error: 'UPLOADTHING_TOKEN is not set' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }
  return handler(req);
}
