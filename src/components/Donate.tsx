import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

export const Donate = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            Support Our Mission
          </span>
          <h2 className="section-title text-foreground mb-6">
            HELP US <span className="text-outline">KEEP PEDALING</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Your donation helps us provide free mental health resources, organize community rides, 
            and support individuals on their journey to wellness. Every dollar makes a difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="font-display uppercase tracking-wider text-lg px-10 py-6 animate-pulse-glow"
            >
              Donate Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="font-display uppercase tracking-wider text-lg px-10 py-6"
            >
              Become a Member
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Keep Pedaling Foundation is a registered 501(c)(3) nonprofit organization. 
              All donations are tax-deductible.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
