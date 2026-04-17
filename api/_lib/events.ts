import { z } from "zod";
import { ensureEventsTable, sql } from "./db";

const eventInputSchema = z.object({
  title: z.string().trim().min(1),
  date_label: z.string().trim().min(1),
  time_label: z.string().trim().min(1),
  location: z.string().trim().min(1),
  description: z.string().trim().min(1),
  featured: z.boolean().default(false),
  signup_link: z.string().trim().nullable().optional(),
  sort_order: z.number().int().default(0),
  show_yoga: z.boolean().default(false),
  show_bike_rental: z.boolean().default(false),
});

export type EventInput = z.infer<typeof eventInputSchema>;

export async function listEvents() {
  await ensureEventsTable();

  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS show_yoga BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS show_bike_rental BOOLEAN NOT NULL DEFAULT FALSE`;

  const rows = await sql`
    SELECT
      id,
      title,
      date_label,
      time_label,
      location,
      description,
      featured,
      signup_link,
      sort_order,
      show_yoga,
      show_bike_rental,
      created_at,
      updated_at
    FROM events
    ORDER BY sort_order ASC, created_at ASC
  `;

  return rows;
}

export function parseEventInput(input: unknown) {
  return eventInputSchema.safeParse(input);
}

export async function createEvent(input: EventInput) {
  await ensureEventsTable();

  const [row] = await sql`
    INSERT INTO events (
      title,
      date_label,
      time_label,
      location,
      description,
      featured,
      signup_link,
      sort_order,
      show_yoga,
      show_bike_rental
    )
    VALUES (
      ${input.title},
      ${input.date_label},
      ${input.time_label},
      ${input.location},
      ${input.description},
      ${input.featured},
      ${input.signup_link || null},
      ${input.sort_order},
      ${input.show_yoga},
      ${input.show_bike_rental}
    )
    RETURNING
      id,
      title,
      date_label,
      time_label,
      location,
      description,
      featured,
      signup_link,
      sort_order,
      show_yoga,
      show_bike_rental,
      created_at,
      updated_at
  `;

  return row;
}

export async function updateEvent(id: string, input: EventInput) {
  await ensureEventsTable();

  const [row] = await sql`
    UPDATE events
    SET
      title = ${input.title},
      date_label = ${input.date_label},
      time_label = ${input.time_label},
      location = ${input.location},
      description = ${input.description},
      featured = ${input.featured},
      signup_link = ${input.signup_link || null},
      sort_order = ${input.sort_order},
      show_yoga = ${input.show_yoga},
      show_bike_rental = ${input.show_bike_rental},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id,
      title,
      date_label,
      time_label,
      location,
      description,
      featured,
      signup_link,
      sort_order,
      show_yoga,
      show_bike_rental,
      created_at,
      updated_at
  `;

  return row ?? null;
}

export async function deleteEvent(id: string) {
  await ensureEventsTable();

  const [row] = await sql`
    DELETE FROM events
    WHERE id = ${id}
    RETURNING id
  `;

  return row ?? null;
}
