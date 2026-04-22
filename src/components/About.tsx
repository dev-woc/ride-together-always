import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useSiteContent } from '@/lib/site-content';

export const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { content } = useSiteContent();
  const about = content.about;

  return (
    <section id="about" className="section-padding bg-background" ref={ref}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-sm">
              <video
                controls
                playsInline
                className="relative z-10 w-full h-auto aspect-[4/3] object-cover scale-[0.92]"
              >
                <source src="/intro-promo.mp4" type="video/mp4" />
              </video>
            </div>
            {/* Accent element */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-4 border-primary rounded-sm -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
              {about.eyebrow}
            </span>
            <h2 className="section-title text-foreground mb-6">
              {about.titleLine1}<br />
              <span className="text-outline">{about.titleLine2}</span>
            </h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>{about.paragraph1}</p>
              <p>{about.paragraph2}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10">
              {about.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <span className="block font-display text-4xl md:text-5xl font-bold text-primary">{stat.value}</span>
                  <span className="text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
