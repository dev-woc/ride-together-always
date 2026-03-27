import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const sponsors: { name: string; tier: 'gold' | 'silver' | 'bronze' }[] = [];

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

        {sponsors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-16 border border-dashed border-border rounded-sm"
          >
            <p className="text-muted-foreground font-display uppercase tracking-wider text-sm">
              Interested in becoming a sponsor?
            </p>
            <a
              href="mailto:KeepPedalingFoundation@gmail.com"
              className="inline-block mt-4 text-primary font-display uppercase tracking-wider hover:underline"
            >
              Get in Touch →
            </a>
          </motion.div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center w-48 h-24 bg-card border border-border rounded-sm px-6 grayscale hover:grayscale-0 transition-all duration-300"
              >
                <span className="font-display text-foreground uppercase tracking-wider text-sm text-center">
                  {sponsor.name}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
