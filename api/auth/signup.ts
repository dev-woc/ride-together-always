import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const sql = neon(process.env.DATABASE_URL!);
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, name, phone } = req.body as {
    email: string; password: string; name: string; phone?: string;
  };

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name are required' });
  }

  const existing = await sql`SELECT id FROM cos_users WHERE email = ${email}`;
  if (existing.length > 0) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const hashed = await bcrypt.hash(password, 12);
  const [user] = await sql`
    INSERT INTO cos_users (email, password, name, phone)
    VALUES (${email}, ${hashed}, ${name}, ${phone ?? null})
    RETURNING id, email, name, role
  `;

  const token = await new SignJWT({ id: user.id, email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);

  return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
