import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stories = [
  {
    id: 'zay',
    src: '/impact/zay-interview.mp4',
    title: "Zay's Story",
    description:
      'Hear directly from a community member about how Keep Pedaling Foundation helped them find healing through cycling and mental health support.',
  },
  {
    id: 'therapy-001',
    src: '/impact/kpf-therapy-001.mp4',
    title: 'KPF Therapy Impact',
    description:
      'A first-hand look at the free therapy resources KPF provides and the real difference they make in the lives of our community members.',
  },
];

export const ImpactStories = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="impact" className="section-padding bg-card" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
            Real Stories
          </span>
          <h2 className="section-title text-foreground">
            IMPACT <span className="text-outline">STORIES</span>
          </h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-2xl mx-auto">
            Behind every pedal stroke is a person. Hear from the community members whose lives have
            been changed by Keep Pedaling Foundation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="flex flex-col"
            >
              <div className="relative overflow-hidden rounded-sm bg-muted aspect-video">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={story.title}
                  className="w-full h-full object-cover"
                >
                  <source src={story.src} type="video/mp4" />
                  <p className="text-muted-foreground p-4">
                    Your browser doesn't support video playback.
                  </p>
                </video>
              </div>
              <div className="mt-5">
                <h3 className="font-display font-bold uppercase tracking-wider text-foreground text-lg mb-2">
                  {story.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{story.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
