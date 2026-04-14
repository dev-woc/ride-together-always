import { z } from "zod";
import { ensureSiteContentTable, sql } from "./db";

const heroSchema = z.object({
  hashtag: z.string().trim().min(1),
  titleLine1: z.string().trim().min(1),
  titleLine2: z.string().trim().min(1),
  tagline: z.string().trim().min(1),
  primaryCtaLabel: z.string().trim().min(1),
  primaryCtaHref: z.string().trim().min(1),
  secondaryCtaLabel: z.string().trim().min(1),
  secondaryCtaHref: z.string().trim().min(1),
});

const aboutStatSchema = z.object({
  value: z.string().trim().min(1),
  label: z.string().trim().min(1),
});

const aboutSchema = z.object({
  eyebrow: z.string().trim().min(1),
  titleLine1: z.string().trim().min(1),
  titleLine2: z.string().trim().min(1),
  paragraph1: z.string().trim().min(1),
  paragraph2: z.string().trim().min(1),
  stats: z.array(aboutStatSchema).length(3),
});

const donateSchema = z.object({
  eyebrow: z.string().trim().min(1),
  headingPrefix: z.string().trim().min(1),
  headingEmphasis: z.string().trim().min(1),
  body: z.string().trim().min(1),
  primaryCtaLabel: z.string().trim().min(1),
  primaryCtaHref: z.string().trim().min(1),
  secondaryCtaLabel: z.string().trim().min(1),
  secondaryCtaHref: z.string().trim().min(1),
  trustCopy: z.string().trim().min(1),
});

const contactSchema = z.object({
  stayConnectedTitle: z.string().trim().min(1),
  stayConnectedSuccessMessage: z.string().trim().min(1),
  stayConnectedButtonLabel: z.string().trim().min(1),
  brandTagline: z.string().trim().min(1),
  instagramUrl: z.string().trim().min(1),
  facebookUrl: z.string().trim().min(1),
  tiktokUrl: z.string().trim().min(1),
  email: z.string().trim().min(1),
  locationLabel: z.string().trim().min(1),
  footerOrganizationLabel: z.string().trim().min(1),
});

export const siteContentSchema = z.object({
  hero: heroSchema,
  about: aboutSchema,
  donate: donateSchema,
  contact: contactSchema,
});

export type SiteContent = z.infer<typeof siteContentSchema>;

const siteContentSectionSchema = z.object({
  key: z.enum(["hero", "about", "donate", "contact"]),
  value: z.unknown(),
});

export function parseSiteContentSection(input: unknown) {
  const parsed = siteContentSectionSchema.safeParse(input);

  if (!parsed.success) {
    return parsed;
  }

  const sectionSchema = siteContentSchema.shape[parsed.data.key];
  const validatedValue = sectionSchema.safeParse(parsed.data.value);

  if (!validatedValue.success) {
    return validatedValue;
  }

  return {
    success: true as const,
    data: {
      key: parsed.data.key,
      value: validatedValue.data,
    },
  };
}

export async function listSiteContent() {
  await ensureSiteContentTable();

  const rows = await sql`
    SELECT key, value_json, updated_at
    FROM site_content
  `;

  return rows;
}

export async function upsertSiteContent<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
  await ensureSiteContentTable();

  const [row] = await sql`
    INSERT INTO site_content (key, value_json, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
    ON CONFLICT (key)
    DO UPDATE SET
      value_json = EXCLUDED.value_json,
      updated_at = NOW()
    RETURNING key, value_json, updated_at
  `;

  return row;
}
