import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Sponsor {
  name: string;
  logo: string;
  href?: string;
}

const sponsors: Sponsor[] = [
  {
    name: 'Lime',
    logo: '/sponsors/lime-logo.png',
    href: 'https://www.li.me',
  },
];

export const Sponsors = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="sponsors" className="section-padding bg-secondary" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
            Our Partners
          </span>
          <h2 className="section-title text-foreground">
            SPONSORS &amp; <span className="text-outline">SUPPORTERS</span>
          </h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-2xl mx-auto">
            We're grateful for the organizations and individuals who help make our mission possible.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-8">
          {sponsors.map((sponsor, index) => {
            const card = (
              <motion.div
                key={sponsor.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center w-48 h-24 bg-card border border-border rounded-sm px-6 grayscale hover:grayscale-0 transition-all duration-300"
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="max-h-14 max-w-full object-contain"
                />
              </motion.div>
            );

            return sponsor.href ? (
              <a key={sponsor.name} href={sponsor.href} target="_blank" rel="noopener noreferrer">
                {card}
              </a>
            ) : card;
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-sm">
            Interested in becoming a sponsor?{' '}
            <a
              href="mailto:KeepPedalingFoundation@gmail.com"
              className="text-primary font-display uppercase tracking-wider hover:underline"
            >
              Get in Touch →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
