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
    const { status } = req.query;
    const apps = status && status !== 'all'
      ? await sql`
          SELECT a.*, u.email as user_email, u.name as user_name
          FROM cos_applications a
          JOIN cos_users u ON a.user_id = u.id
          WHERE a.status = ${status as string}
          ORDER BY a.submitted_at DESC
        `
      : await sql`
          SELECT a.*, u.email as user_email, u.name as user_name
          FROM cos_applications a
          JOIN cos_users u ON a.user_id = u.id
          ORDER BY a.submitted_at DESC
        `;
    return res.status(200).json({ applications: apps });
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    const { status } = req.body as { status: string };
    const valid = ['pending', 'reviewing', 'approved', 'rejected'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const [app] = await sql`
      UPDATE cos_applications
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id as string}
      RETURNING id, status
    `;
    return res.status(200).json({ application: app });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
