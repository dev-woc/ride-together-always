import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export const sql = neon(databaseUrl);

let eventsTableReady: Promise<void> | null = null;
let siteContentTableReady: Promise<void> | null = null;
let resourcesTableReady: Promise<void> | null = null;

export function ensureEventsTable() {
  if (!eventsTableReady) {
    eventsTableReady = sql`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        date_label TEXT NOT NULL,
        time_label TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        signup_link TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.then(() => undefined);
  }

  return eventsTableReady;
}

export function ensureResourcesTable() {
  if (!resourcesTableReady) {
    resourcesTableReady = sql`
      CREATE TABLE IF NOT EXISTS resources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        link TEXT NOT NULL,
        urgent BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.then(() => undefined);
  }

  return resourcesTableReady;
}

export function ensureSiteContentTable() {
  if (!siteContentTableReady) {
    siteContentTableReady = sql`
      CREATE TABLE IF NOT EXISTS site_content (
        key TEXT PRIMARY KEY,
        value_json JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.then(() => undefined);
  }

  return siteContentTableReady;
}
