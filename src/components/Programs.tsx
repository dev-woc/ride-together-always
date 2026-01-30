import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Bike, Heart, Users, Brain } from 'lucide-react';
import cyclingDetail from '@/assets/cycling-detail.jpg';
import wellnessCycling from '@/assets/wellness-cycling.jpg';

const programs = [
  {
    icon: Bike,
    title: 'Cycling Club',
    description: 'Join our community rides designed for all skill levels. Experience the joy of cycling while connecting with like-minded individuals.',
    image: cyclingDetail,
  },
  {
    icon: Brain,
    title: 'Mental Health Resources',
    description: 'Access a wide range of resources tailored to support your mental well-being, from therapy connections to practical wellness tips.',
    image: wellnessCycling,
  },
  {
    icon: Heart,
    title: 'Cycle of Support',
    description: 'Our signature program connecting cyclists with mental health professionals for transformative healing journeys.',
    image: null,
  },
  {
    icon: Users,
    title: 'Community Events',
    description: 'Monthly gatherings, group rides, and wellness workshops that bring our community together for collective healing.',
    image: null,
  },
];

export const Programs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="programs" className="section-padding bg-secondary" ref={ref}>
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
            What We Do
          </span>
          <h2 className="section-title text-foreground">
            OUR <span className="text-outline">PROGRAMS</span>
          </h2>
        </motion.div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-card rounded-sm overflow-hidden border border-border card-hover"
            >
              {program.image ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
              ) : (
                <div className="h-48 bg-muted flex items-center justify-center">
                  <program.icon size={64} className="text-primary/30" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center">
                    <program.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold uppercase text-foreground">
                    {program.title}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {program.description}
                </p>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 mt-4 text-primary font-display text-sm uppercase tracking-wider hover:gap-3 transition-all"
                >
                  Learn More
                  <span>→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
