import { requireAdmin } from "../_lib/auth";
import { sql } from "../_lib/db";
import { json, methodNotAllowed, serverError } from "../_lib/http";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  if (req.method !== "GET") return methodNotAllowed();

  try {
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

    const grouped: Record<string, typeof rows> = {};
    for (const event of events) {
      grouped[event.title as string] = [];
    }
    for (const row of rows) {
      const key = (row.event_name as string) || "Bike N Thrive";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    }

    return json({ grouped, signups: rows });
  } catch (error) {
    console.error("Ride signups fetch failed", error);
    return serverError("Failed to fetch ride signups");
  }
}
