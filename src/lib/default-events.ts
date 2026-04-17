import type { SiteEvent } from "@/types/events";

export const defaultEvents: SiteEvent[] = [
  {
    id: "bike-n-thrive",
    title: "Bike N Thrive",
    date_label: "Saturday, March 28",
    time_label: "8:00 AM",
    location: "RTW Photography Studio, 520 N Parramore Ave, Orlando",
    description:
      "A special community ride and wellness experience - group cycling, fresh juices, yoga, coffee, and free Lime bikes. Open to all levels!",
    featured: true,
    signup_link: "/ride-signup?event=Bike+N+Thrive&yoga=1&bikes=1",
    sort_order: 0,
    show_yoga: true,
    show_bike_rental: true,
  },
  {
    id: "saturday-morning-ride",
    title: "Saturday Morning Ride",
    date_label: "Every Saturday",
    time_label: "7:00 AM",
    location: "Lake Eola Park, Orlando",
    description:
      "Weekly community ride open to all skill levels. Join us for coffee after!",
    featured: false,
    signup_link: "/ride-signup?event=Saturday+Morning+Ride",
    sort_order: 1,
    show_yoga: false,
    show_bike_rental: false,
  },
  {
    id: "impact-ride",
    title: "The Impact Ride",
    date_label: "Coming Spring 2026",
    time_label: "TBA",
    location: "Orlando Metro Area",
    description:
      "Annual charity ride raising awareness and funds for mental health resources.",
    featured: false,
    signup_link: null,
    sort_order: 2,
    show_yoga: false,
    show_bike_rental: false,
  },
];
