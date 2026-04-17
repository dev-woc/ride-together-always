import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { ContactModal } from './ContactModal';

const navLinks = [
  { name: 'Home', href: '/#home' },
  { name: 'Programs', href: '/#programs' },
  { name: 'Events', href: '/#events' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src={logo} alt="Keep Pedaling Foundation" className="h-12 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
            <Link
              to="/about"
              className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/community"
              className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Our Community
            </Link>
            <Link
              to="/resources"
              className="font-display text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Mental Health Resources
            </Link>
          </div>

          {/* Social & Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="https://www.facebook.com/people/Keep-Pedaling-Foundation/61565706314697/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="text-muted-foreground hover:text-foreground transition-colors">
              <Facebook size={20} aria-hidden="true" />
            </a>
            <a href="https://www.instagram.com/keeppedalingfoundation" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
              <Instagram size={20} aria-hidden="true" />
            </a>
            <Button variant="outline" className="ml-2 font-display uppercase tracking-wider" onClick={() => setContactOpen(true)}>
              Contact Us
            </Button>
            <a href="https://www.zeffy.com/en-US/donation-form/a4b252d0-143c-4807-b3ab-2f8162d02783" target="_blank" rel="noopener noreferrer">
              <Button variant="default" className="font-display uppercase tracking-wider">
                Donate
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            className="lg:hidden p-2 text-foreground"
          >
            {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-display text-lg uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className="font-display text-lg uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                About Us
              </Link>
              <Link
                to="/community"
                onClick={() => setIsOpen(false)}
                className="font-display text-lg uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Our Community
              </Link>
              <Link
                to="/resources"
                onClick={() => setIsOpen(false)}
                className="font-display text-lg uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Mental Health Resources
              </Link>
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <a href="https://www.facebook.com/people/Keep-Pedaling-Foundation/61565706314697/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Facebook size={24} aria-hidden="true" />
                </a>
                <a href="https://www.instagram.com/keeppedalingfoundation" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram size={24} aria-hidden="true" />
                </a>
              </div>
              <Button variant="outline" className="mt-2 font-display uppercase tracking-wider w-full" onClick={() => { setIsOpen(false); setContactOpen(true); }}>
                Contact Us
              </Button>
              <a href="https://www.zeffy.com/en-US/donation-form/a4b252d0-143c-4807-b3ab-2f8162d02783" target="_blank" rel="noopener noreferrer">
                <Button variant="default" className="mt-2 font-display uppercase tracking-wider w-full">
                  Donate
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </motion.nav>
  );
};
