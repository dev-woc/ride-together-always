import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';

const sql = neon(process.env.DATABASE_URL!);
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getAdminFromRequest(req: VercelRequest) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const { payload } = await jwtVerify(auth.slice(7), secret);
    const p = payload as { id: string; role: string };
    if (p.role !== 'admin') return null;
    return p;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    await sql`ALTER TABLE ride_signups ADD COLUMN IF NOT EXISTS event_name TEXT NOT NULL DEFAULT 'Bike N Thrive'`;

    const [rows, events] = await Promise.all([
      sql`
        SELECT id, full_name, email, phone_number, instagram_handle,
               ride_group, yoga_signup, lime_bike, bike_rental_waiver_agreed,
               driver_license_data, event_name, created_at
        FROM ride_signups
        ORDER BY event_name ASC, created_at DESC
      `,
      sql`SELECT title FROM events ORDER BY sort_order ASC, created_at ASC`,
    ]);

    // Build grouped map seeded with all known event titles (so empty events still show)
    const grouped: Record<string, typeof rows> = {};
    for (const event of events) {
      grouped[event.title as string] = [];
    }
    for (const row of rows) {
      const key = (row.event_name as string) || 'Bike N Thrive';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    }

    return res.status(200).json({ grouped, signups: rows });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
