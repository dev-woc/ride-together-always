import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, BookOpen, Phone, MessageCircle } from 'lucide-react';

type Resource = {
  id: string;
  title: string;
  description: string;
  link: string;
  urgent: boolean;
  sort_order: number;
};

const fallbackResources: Resource[] = [
  {
    id: '1',
    title: '988 Suicide & Crisis Lifeline',
    description: 'Free, 24/7 support for people in distress. Call or text 988.',
    link: 'https://988lifeline.org/',
    urgent: true,
    sort_order: 0,
  },
  {
    id: '2',
    title: 'Crisis Text Line',
    description: 'Text HOME to 741741 to connect with a trained crisis counselor.',
    link: 'https://www.crisistextline.org/',
    urgent: true,
    sort_order: 1,
  },
  {
    id: '3',
    title: 'Mental Health America',
    description: 'Screening tools, resources, and support for mental health conditions.',
    link: 'https://www.mhanational.org/',
    urgent: false,
    sort_order: 2,
  },
  {
    id: '4',
    title: 'NAMI (National Alliance on Mental Illness)',
    description: 'Education, support groups, and advocacy for mental health.',
    link: 'https://www.nami.org/',
    urgent: false,
    sort_order: 3,
  },
];

function iconFor(r: Resource) {
  if (r.urgent) return r.title.toLowerCase().includes('text') ? MessageCircle : Phone;
  return BookOpen;
}

export const Resources = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const { data } = useQuery({
    queryKey: ['resources'],
    queryFn: () => fetch('/api/resources').then(r => r.json()) as Promise<{ resources: Resource[] }>,
  });

  const resources = data?.resources?.length ? data.resources : fallbackResources;

  return (
    <section id="resources" className="section-padding bg-secondary" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
            Get Help
          </span>
          <h2 className="section-title text-foreground">
            MENTAL HEALTH <span className="text-outline">RESOURCES</span>
          </h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore a wide range of resources tailored to support your mental well-being.
            Whether you're seeking information, support groups, or practical tips,
            we have the tools to help you on your journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {resources.map((resource, index) => {
            const Icon = iconFor(resource);
            return (
              <motion.a
                key={resource.id}
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`group p-6 rounded-sm border transition-all duration-300 hover:border-primary/50 flex gap-4 ${
                  resource.urgent ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'
                }`}
              >
                <div className={`w-12 h-12 flex-shrink-0 rounded-sm flex items-center justify-center ${
                  resource.urgent ? 'bg-primary' : 'bg-muted'
                }`}>
                  <Icon size={24} className={resource.urgent ? 'text-primary-foreground' : 'text-primary'} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-bold uppercase text-foreground group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                  </div>
                  <p className="text-muted-foreground mt-2">{resource.description}</p>
                  {resource.urgent && (
                    <span className="inline-block mt-3 text-xs font-display uppercase tracking-wider text-primary">
                      Available 24/7
                    </span>
                  )}
                </div>
              </motion.a>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 p-8 bg-card rounded-sm border border-border text-center"
        >
          <p className="text-muted-foreground mb-4">
            Need someone to talk to? Our community is here for you.
          </p>
          <a
            href="mailto:KeepPedalingFoundation@gmail.com"
            className="text-primary font-display uppercase tracking-wider hover:underline"
          >
            Reach Out to Us →
          </a>
        </motion.div>
      </div>
    </section>
  );
};
