import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import heroImage from '@/assets/hero-cycling.jpg';
import { useSiteContent } from '@/lib/site-content';

export const Hero = () => {
  const { content } = useSiteContent();
  const hero = content.hero;

  return (
    <section id="home" className="relative w-full min-h-screen bg-background flex flex-col items-center justify-start overflow-hidden">

      {/* Content layered over video window */}
      <div className="relative z-10 w-full flex flex-col items-center pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-5xl mx-auto px-6 text-center"
        >
          {/* Hashtag above video */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-display text-lg md:text-xl text-muted-foreground uppercase tracking-[0.3em] mb-4"
          >
            {hero.hashtag}
          </motion.p>

          {/* Contained video window */}
          <div className="relative mx-auto mb-0" style={{ width: '42%', maxWidth: '520px' }}>
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto block"
              poster={heroImage}
            >
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Main Title overlapping below video */}
          <h1 className="font-display font-bold uppercase leading-none -mt-6 mb-4">
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-outline-thick">
              {hero.titleLine1}
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-foreground">
              {hero.titleLine2}
            </span>
          </h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="font-body text-xl md:text-2xl text-muted-foreground italic mt-6 mb-10"
          >
            {hero.tagline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href={hero.primaryCtaHref}
              className="btn-hero-primary inline-flex items-center justify-center rounded-sm"
            >
              {hero.primaryCtaLabel}
            </a>
            <a
              href={hero.secondaryCtaHref}
              className="btn-hero-outline inline-flex items-center justify-center rounded-sm"
            >
              {hero.secondaryCtaLabel}
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="pb-8"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-muted-foreground"
        >
          <ChevronDown size={32} />
        </motion.div>
      </motion.div>
    </section>
  );
};
