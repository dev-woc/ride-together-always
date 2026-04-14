export type HeroContent = {
  hashtag: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export type AboutStat = {
  value: string;
  label: string;
};

export type AboutContent = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  paragraph1: string;
  paragraph2: string;
  stats: AboutStat[];
};

export type DonateContent = {
  eyebrow: string;
  headingPrefix: string;
  headingEmphasis: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  trustCopy: string;
};

export type ContactContent = {
  stayConnectedTitle: string;
  stayConnectedSuccessMessage: string;
  stayConnectedButtonLabel: string;
  brandTagline: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  email: string;
  locationLabel: string;
  footerOrganizationLabel: string;
};

export type SiteContent = {
  hero: HeroContent;
  about: AboutContent;
  donate: DonateContent;
  contact: ContactContent;
};
