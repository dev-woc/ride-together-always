import { Facebook, Instagram, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { useSiteContent } from '@/lib/site-content';

const footerLinks = {
  navigation: [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Programs', href: '#programs' },
    { name: 'Events', href: '#events' },
  ],
  resources: [
    { name: 'Mental Health Resources', href: '#resources' },
    { name: 'Cycling Club', href: '#programs' },
    { name: 'Donate', href: '#' },
    { name: 'Shop', href: '#' },
  ],
};

export const Footer = () => {
  const { content } = useSiteContent();
  const contact = content.contact;

  return (
    <footer id="contact" className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img src={logo} alt="Keep Pedaling Foundation" className="h-16 w-auto" />
            </div>
            <p className="text-muted-foreground italic text-lg mb-6">
              {contact.brandTagline}
            </p>
            <div className="flex items-center gap-4">
              <a
                href={contact.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Keep Pedaling Foundation on Facebook"
                className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook size={20} aria-hidden="true" />
              </a>
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Keep Pedaling Foundation on Instagram"
                className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram size={20} aria-hidden="true" />
              </a>
              <a
                href={contact.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Keep Pedaling Foundation on TikTok"
                className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors font-display font-bold text-xs"
              >
                <span aria-hidden="true">TT</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-foreground mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Contact */}
          <div>
            <h4 className="font-display text-sm uppercase tracking-wider text-foreground mb-6">
              Get Involved
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-border">
              <a 
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <Mail size={16} />
                {contact.email}
              </a>
              <span className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                <MapPin size={16} />
                {contact.locationLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Keep Pedaling Foundation. All rights reserved.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/legal?tab=terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Use
            </Link>
            <Link to="/legal?tab=nondiscrimination" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Nondiscrimination
            </Link>
            <p className="text-sm text-muted-foreground">
              {contact.footerOrganizationLabel} · EIN: 99-3038427
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
