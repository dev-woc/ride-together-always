import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import communityImage from '@/assets/community-cycling.jpg';

export const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
              <img
                src={communityImage}
                alt="Keep Pedaling Foundation community cycling group"
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
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
              About Us
            </span>
            <h2 className="section-title text-foreground mb-6">
              PEDALING FOR<br />
              <span className="text-outline">MENTAL HEALTH</span>
            </h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                At Keep Pedaling Foundation, we are committed to advancing mental health 
                awareness and breaking down barriers to support. Through the transformative 
                power of cycling, we encourage physical well-being while creating a space 
                for individuals to access the vital resources they need.
              </p>
              <p>
                Our mission is to help everyone pedal their way toward healing, resilience, 
                and a brighter, healthier future. We believe that when wheels turn, minds heal.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10">
              <div className="text-center">
                <span className="block font-display text-4xl md:text-5xl font-bold text-primary">500+</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider">Riders</span>
              </div>
              <div className="text-center">
                <span className="block font-display text-4xl md:text-5xl font-bold text-primary">50+</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider">Events</span>
              </div>
              <div className="text-center">
                <span className="block font-display text-4xl md:text-5xl font-bold text-primary">1K+</span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider">Miles</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
