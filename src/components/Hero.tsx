import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import heroImage from '@/assets/hero-cycling.jpg';
import { useSiteContent } from '@/lib/site-content';

export const Hero = () => {
  const { content } = useSiteContent();
  const hero = content.hero;

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden bg-black">
      {/* Full-bleed background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={heroImage}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content centered over video */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-5xl mx-auto">
          <p className="font-display text-sm md:text-base text-white/70 uppercase tracking-[0.4em] mb-6">
            {hero.hashtag}
          </p>

          <h1 className="font-display font-bold uppercase leading-none mb-6">
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-white drop-shadow-lg">
              {hero.titleLine1}
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-outline-thick drop-shadow-lg">
              {hero.titleLine2}
            </span>
          </h1>

          <p className="font-body text-xl md:text-2xl text-white/80 italic mb-10">
            {hero.tagline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={hero.primaryCtaHref}
              className="btn-hero-primary inline-flex items-center justify-center rounded-sm"
            >
              {hero.primaryCtaLabel}
            </a>
            <a
              href={hero.secondaryCtaHref}
              className="btn-hero-outline inline-flex items-center justify-center rounded-sm !border-white !text-white hover:!bg-white hover:!text-black"
            >
              {hero.secondaryCtaLabel}
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-white/60"
        >
          <ChevronDown size={32} />
        </motion.div>
      </motion.div>
    </section>
  );
};
