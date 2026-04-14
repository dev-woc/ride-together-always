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
    const signups = await sql`
      SELECT id, full_name, email, phone_number, instagram_handle,
             ride_group, yoga_signup, lime_bike, bike_rental_waiver_agreed,
             driver_license_data, created_at
      FROM ride_signups
      ORDER BY created_at DESC
    `;
    return res.status(200).json({ signups });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
