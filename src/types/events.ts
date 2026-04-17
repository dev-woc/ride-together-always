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
  show_yoga: boolean;
  show_bike_rental: boolean;
  created_at?: string;
  updated_at?: string;
};
