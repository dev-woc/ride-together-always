import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const events = [
  {
    title: 'Saturday Morning Ride',
    date: 'Every Saturday',
    time: '7:00 AM',
    location: 'Lake Eola Park, Orlando',
    description: 'Weekly community ride open to all skill levels. Join us for coffee after!',
    featured: true,
  },
  {
    title: 'Critical Mass Orlando',
    date: 'Last Friday Monthly',
    time: '6:30 PM',
    location: 'Downtown Orlando',
    description: 'Celebrate cycling culture with the city-wide group ride through downtown.',
    featured: false,
  },
  {
    title: 'Mental Health Awareness Ride',
    date: 'Coming Spring 2026',
    time: 'TBA',
    location: 'Orlando Metro Area',
    description: 'Annual charity ride raising awareness and funds for mental health resources.',
    featured: false,
  },
];

export const Events = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="events" className="section-padding bg-background" ref={ref}>
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
            Join Us
          </span>
          <h2 className="section-title text-foreground">
            UPCOMING <span className="text-outline">EVENTS</span>
          </h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay in the loop with our exciting cycling events designed to raise awareness 
            and foster community support. Whether you're a seasoned rider or a beginner, 
            we have rides for everyone.
          </p>
        </motion.div>

        {/* Events List */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative p-6 lg:p-8 rounded-sm border transition-all duration-300 hover:border-primary/50 ${
                event.featured 
                  ? 'bg-card border-primary' 
                  : 'bg-card border-border'
              }`}
            >
              {event.featured && (
                <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-display uppercase tracking-wider px-3 py-1 rounded-sm">
                  Featured
                </span>
              )}
              <div className="grid lg:grid-cols-[1fr,auto] gap-6 items-center">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase text-foreground mb-4">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {event.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={16} className="text-primary" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin size={16} className="text-primary" />
                      {event.location}
                    </span>
                  </div>
                </div>
                <Button 
                  variant={event.featured ? "default" : "outline"}
                  className="font-display uppercase tracking-wider"
                >
                  {event.time === 'TBA' ? 'Get Notified' : 'RSVP Now'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a href="#" className="text-primary font-display uppercase tracking-wider hover:underline">
            View All Events →
          </a>
        </motion.div>
      </div>
    </section>
  );
};
