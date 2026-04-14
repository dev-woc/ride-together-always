import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';

const sql = neon(process.env.DATABASE_URL!);
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getUserFromRequest(req: VercelRequest) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const { payload } = await jwtVerify(auth.slice(7), secret);
    return payload as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const [app] = await sql`SELECT * FROM cos_applications WHERE user_id = ${user.id} LIMIT 1`;
    return res.status(200).json({ application: app ?? null });
  }

  if (req.method === 'POST') {
    const existing = await sql`SELECT id FROM cos_applications WHERE user_id = ${user.id}`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'You have already submitted an application' });
    }

    const {
      full_name, email, phone, date_of_birth, city_state,
      prior_therapy, has_insurance, current_challenges,
      mental_health_description, therapy_motivation, therapy_goals, therapy_barriers,
      weekly_commitment, has_device, testimonial_willing,
      therapist_preference, preferred_therapist_name, preferred_therapist_contact,
      intro_video_url,
    } = req.body;

    const [app] = await sql`
      INSERT INTO cos_applications (
        user_id, full_name, email, phone, date_of_birth, city_state,
        prior_therapy, has_insurance, current_challenges,
        mental_health_description, therapy_motivation, therapy_goals, therapy_barriers,
        weekly_commitment, has_device, testimonial_willing,
        therapist_preference, preferred_therapist_name, preferred_therapist_contact,
        intro_video_url
      ) VALUES (
        ${user.id}, ${full_name}, ${email}, ${phone}, ${date_of_birth}, ${city_state},
        ${prior_therapy}, ${has_insurance}, ${current_challenges},
        ${mental_health_description}, ${therapy_motivation}, ${therapy_goals}, ${therapy_barriers},
        ${weekly_commitment}, ${has_device}, ${testimonial_willing},
        ${therapist_preference}, ${preferred_therapist_name ?? null}, ${preferred_therapist_contact ?? null},
        ${intro_video_url ?? null}
      ) RETURNING *
    `;

    return res.status(201).json({ application: app });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
