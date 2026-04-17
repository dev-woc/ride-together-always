import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSiteContent } from '@/lib/site-content';
import { ContactModal } from './ContactModal';

export const Donate = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { content } = useSiteContent();
  const donate = content.donate;
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section className="section-padding bg-background relative overflow-hidden" ref={ref}>
      {/* Background accent */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
            {donate.eyebrow}
          </span>
          <h2 className="section-title text-foreground mb-6">
            {donate.headingPrefix} <span className="text-outline">{donate.headingEmphasis}</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            {donate.body}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href={donate.primaryCtaHref} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="font-display uppercase tracking-wider text-lg px-10 py-6 animate-pulse-glow"
              >
                {donate.primaryCtaLabel}
              </Button>
            </a>
            <Button
              variant="outline"
              size="lg"
              className="font-display uppercase tracking-wider text-lg px-10 py-6"
              onClick={() => setContactOpen(true)}
            >
              {donate.secondaryCtaLabel}
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {donate.trustCopy}
            </p>
          </div>
        </motion.div>
      </div>

      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </section>
  );
};
