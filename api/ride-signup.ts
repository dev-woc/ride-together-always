import { neon } from '@neondatabase/serverless';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: {
    email: string;
    full_name: string;
    phone_number: string;
    instagram_handle?: string;
    ride_group: string;
    waiver_agreed: boolean;
    yoga_signup: boolean;
    lime_bike: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { email, full_name, phone_number, instagram_handle, ride_group, waiver_agreed, yoga_signup, lime_bike } = body;

  if (!email || !full_name || !phone_number || !ride_group || !waiver_agreed) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      INSERT INTO ride_signups (email, full_name, phone_number, instagram_handle, ride_group, waiver_agreed, yoga_signup, lime_bike)
      VALUES (${email}, ${full_name}, ${phone_number}, ${instagram_handle ?? null}, ${ride_group}, ${waiver_agreed}, ${yoga_signup}, ${lime_bike})
    `;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('DB error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save signup' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
