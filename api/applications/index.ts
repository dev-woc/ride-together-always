import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { jwtVerify } from 'jose';
import { logPhiAccess } from '../_lib/audit';

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

function getClientIp(req: VercelRequest): string | undefined {
  const fwd = req.headers['x-forwarded-for'];
  if (Array.isArray(fwd)) return fwd[0];
  return fwd?.split(',')[0].trim() ?? undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const ip = getClientIp(req);
  const ua = Array.isArray(req.headers['user-agent'])
    ? req.headers['user-agent'][0]
    : req.headers['user-agent'];

  if (req.method === 'GET') {
    const [app] = await sql`SELECT * FROM cos_applications WHERE user_id = ${user.id} LIMIT 1`;

    logPhiAccess({
      accessorType: 'cos_user',
      accessorId: user.id,
      accessorEmail: user.email,
      action: 'view_application',
      resourceType: 'cos_application',
      resourceId: (app as { id?: string } | undefined)?.id,
      ipAddress: ip,
      userAgent: ua,
    });

    return res.status(200).json({ application: app ?? null });
  }

  if (req.method === 'POST') {
    const existing = await sql`SELECT id FROM cos_applications WHERE user_id = ${user.id}`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'You have already submitted an application' });
    }

    const {
      full_name, email, phone, gender, date_of_birth, city_state,
      prior_therapy, has_insurance, current_challenges,
      video_documentation, testimonial_willing,
      mental_health_description, therapy_motivation, therapy_goals, therapy_barriers,
      weekly_commitment, has_device,
      therapist_preference, preferred_therapist_name, preferred_therapist_contact,
      intro_video_url,
    } = req.body;

    const [app] = await sql`
      INSERT INTO cos_applications (
        user_id, full_name, email, phone, gender, date_of_birth, city_state,
        prior_therapy, has_insurance, current_challenges,
        video_documentation, testimonial_willing,
        mental_health_description, therapy_motivation, therapy_goals, therapy_barriers,
        weekly_commitment, has_device,
        therapist_preference, preferred_therapist_name, preferred_therapist_contact,
        intro_video_url
      ) VALUES (
        ${user.id}, ${full_name}, ${email}, ${phone}, ${gender ?? null}, ${date_of_birth}, ${city_state},
        ${prior_therapy}, ${has_insurance}, ${current_challenges},
        ${video_documentation ?? null}, ${testimonial_willing ?? null},
        ${mental_health_description}, ${therapy_motivation}, ${therapy_goals}, ${therapy_barriers},
        ${weekly_commitment}, ${has_device},
        ${therapist_preference ?? null}, ${preferred_therapist_name ?? null}, ${preferred_therapist_contact ?? null},
        ${intro_video_url ?? null}
      ) RETURNING *
    `;

    logPhiAccess({
      accessorType: 'cos_user',
      accessorId: user.id,
      accessorEmail: user.email,
      action: 'submit_application',
      resourceType: 'cos_application',
      resourceId: (app as { id?: string } | undefined)?.id,
      ipAddress: ip,
      userAgent: ua,
    });

    return res.status(201).json({ application: app });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
