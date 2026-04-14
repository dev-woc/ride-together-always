export type SiteEvent = {
  id: string;
  title: string;
  date_label: string;
  time_label: string;
  location: string;
  description: string;
  featured: boolean;
  signup_link: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};
