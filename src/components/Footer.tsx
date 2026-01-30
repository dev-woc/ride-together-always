import { Facebook, Instagram, Mail, MapPin } from 'lucide-react';
import logo from '@/assets/logo.png';

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
              "Biking for the culture, healing for the soul"
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.facebook.com/people/Keep-Pedaling-Foundation/61565706314697/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://www.instagram.com/keeppedalingfoundation/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram size={20} />
              </a>
              {/* TikTok icon placeholder */}
              <a 
                href="https://www.tiktok.com/@keeppedalingfoundation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors font-display font-bold text-xs"
              >
                TT
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
                href="mailto:KeepPedalingFoundation@gmail.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <Mail size={16} />
                KeepPedalingFoundation@gmail.com
              </a>
              <span className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                <MapPin size={16} />
                Orlando, Florida
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Keep Pedaling Foundation. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            A 501(c)(3) Nonprofit Organization
          </p>
        </div>
      </div>
    </footer>
  );
};
