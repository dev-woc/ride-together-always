import { useQuery } from "@tanstack/react-query";
import type { SiteContent } from "@/types/site-content";

export const defaultSiteContent: SiteContent = {
  hero: {
    hashtag: "#KeepPedaling",
    titleLine1: "KEEP",
    titleLine2: "PEDALING",
    tagline: "Biking for the culture, healing for the soul",
    primaryCtaLabel: "Join Our Mission",
    primaryCtaHref: "#programs",
    secondaryCtaLabel: "Learn More",
    secondaryCtaHref: "#about",
  },
  about: {
    eyebrow: "About Us",
    titleLine1: "PEDALING FOR",
    titleLine2: "MENTAL HEALTH",
    paragraph1:
      "At Keep Pedaling Foundation, we are committed to advancing mental health awareness and breaking down barriers to support. Through the transformative power of cycling, we encourage physical well-being while creating a space for individuals to access the vital resources they need.",
    paragraph2:
      "Our mission is to help everyone pedal their way toward healing, resilience, and a brighter, healthier future. We believe that when wheels turn, minds heal.",
    stats: [
      { value: "500+", label: "Riders" },
      { value: "50+", label: "Events" },
      { value: "1K+", label: "Miles" },
    ],
  },
  donate: {
    eyebrow: "Support Our Mission",
    headingPrefix: "HELP US",
    headingEmphasis: "KEEP PEDALING",
    body:
      "Your donation helps us provide free mental health resources, organize community rides, and support individuals on their journey to wellness. Every dollar makes a difference.",
    primaryCtaLabel: "Donate Now",
    primaryCtaHref: "#",
    secondaryCtaLabel: "Become a Member",
    secondaryCtaHref: "#",
    trustCopy:
      "Keep Pedaling Foundation is a registered 501(c)(3) nonprofit organization. All donations are tax-deductible.",
  },
  contact: {
    stayConnectedTitle: "Stay Connected",
    stayConnectedSuccessMessage: "Thanks! We'll be in touch.",
    stayConnectedButtonLabel: "Send",
    brandTagline: '"Biking for the culture, healing for the soul"',
    instagramUrl: "https://www.instagram.com/keeppedalingfoundation/",
    facebookUrl: "https://www.facebook.com/people/Keep-Pedaling-Foundation/61565706314697/",
    tiktokUrl: "https://www.tiktok.com/@keeppedalingfoundation",
    email: "KeepPedalingFoundation@gmail.com",
    locationLabel: "Orlando, Florida",
    footerOrganizationLabel: "A 501(c)(3) Nonprofit Organization",
  },
};

export function mergeSiteContent(content?: Partial<SiteContent> | Record<string, unknown>) {
  const next = (content || {}) as Partial<SiteContent>;

  return {
    hero: { ...defaultSiteContent.hero, ...(next.hero || {}) },
    about: {
      ...defaultSiteContent.about,
      ...(next.about || {}),
      stats:
        Array.isArray(next.about?.stats) && next.about.stats.length === 3
          ? next.about.stats
          : defaultSiteContent.about.stats,
    },
    donate: { ...defaultSiteContent.donate, ...(next.donate || {}) },
    contact: { ...defaultSiteContent.contact, ...(next.contact || {}) },
  };
}

export function useSiteContent() {
  const query = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const response = await fetch("/api/site-content");

      if (!response.ok) {
        throw new Error("Failed to load site content");
      }

      const data = (await response.json()) as { content: Partial<SiteContent> };
      return mergeSiteContent(data.content);
    },
    staleTime: 1000 * 60,
  });

  return {
    ...query,
    content: query.data || defaultSiteContent,
  };
}
