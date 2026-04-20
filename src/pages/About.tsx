import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import foundersGroup from '@/assets/founders-group.jpg';
import wellnessCycling from '@/assets/wellness-cycling.jpg';
import founderDimitri from '@/assets/founder-dimitri.png';
import founderKeron from '@/assets/founder-keron.png';
import founderMikenson from '@/assets/founder-mikenson.png';

const founders = [
  {
    name: 'Mikenson Deroche',
    title: 'Co-Founder',
    location: 'Orlando, FL',
    bio: 'Emergency Management Consultant originally from Fort Pierce, FL. Mikenson channels his expertise in crisis response into building mental health infrastructure for the KPF community, ensuring everyone has access to the support they need.',
    photo: founderMikenson,
  },
  {
    name: 'Keron Thompson',
    nickname: 'Teezy',
    title: 'Co-Founder',
    location: 'Orlando, FL',
    bio: 'Promoter and Event Planner with a deep passion for fitness and inspiring healthy lifestyles. Keron brings the energy and vision that turns every KPF ride into an unforgettable community experience.',
    photo: founderKeron,
  },
  {
    name: 'Dimitri Jean-Pierre',
    nickname: 'Meech The Insurance Guy',
    title: 'Co-Founder',
    location: 'Orlando, FL',
    bio: 'Health and Life Insurance agent dedicated to helping others and investing in younger generations. Dimitri ensures our community has the resources and protection they need to pedal forward with confidence.',
    photo: founderDimitri,
  },
];

const coreValues = [
  {
    label: 'Inclusive Community',
    description: 'We build a welcoming space where everyone — regardless of background, ability, or experience — belongs on the ride.',
  },
  {
    label: 'Mental Health Advocacy',
    description: 'We actively work to reduce stigma and open honest conversations about mental wellness in every community we touch.',
  },
  {
    label: 'Cycling as Healing',
    description: 'We believe in the transformative power of cycling — that turning the pedals can turn the tide on mental health challenges.',
  },
  {
    label: 'Resilience',
    description: 'We encourage perseverance through the hard miles, knowing that every pedal stroke builds strength — physically and mentally.',
  },
  {
    label: 'Meaningful Relationships',
    description: 'We foster genuine human connection, because healing happens in community, not in isolation.',
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary rounded-full blur-[200px]" />
        </div>
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block"
          >
            About Us
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display font-bold uppercase leading-none text-5xl md:text-7xl lg:text-8xl"
          >
            <span className="text-foreground">OUR </span>
            <span className="text-outline">STORY</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 text-muted-foreground text-lg md:text-xl leading-relaxed max-w-3xl"
          >
            Keep Pedaling Foundation is a non-profit dedicated to raising mental health awareness
            through the power of cycling. Our mission is to create a welcoming community that supports
            both mental and physical well-being. By combining cycling with mental health advocacy, we
            help individuals build resilience and find personal growth.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-card">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
                How It Started
              </span>
              <h2 className="font-display font-bold uppercase text-3xl md:text-4xl text-foreground mb-6">
                BORN FROM <span className="text-outline">PERSONAL HEALING</span>
              </h2>
              <div className="space-y-5 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Keep Pedaling Foundation was born from personal experiences with mental health
                  challenges and a shared belief that movement — specifically cycling — has the power
                  to change lives.
                </p>
                <p>
                  Three Orlando-based friends united around a simple idea: what if we could combine the
                  joy of riding with real mental health advocacy? What if community rides could also be
                  safe spaces for honest conversation?
                </p>
                <p>
                  What started as rides among friends has grown into a registered 501(c)(3) nonprofit
                  serving the greater Orlando area — providing free therapy resources, hosting community
                  events, and building a movement where mental and physical wellness ride together.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src={foundersGroup}
                alt="KPF founders"
                className="w-full h-auto rounded-sm object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-4 -left-4 w-28 h-28 border-4 border-primary rounded-sm -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="section-padding bg-background">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
              The Team
            </span>
            <h2 className="section-title text-foreground">
              MEET THE <span className="text-outline">FOUNDERS</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {founders.map((founder, index) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="bg-card border border-border rounded-sm p-8"
              >
                {founder.photo ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary mb-6">
                    <img src={founder.photo} alt={founder.name} className="w-full h-full object-cover object-top" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-6">
                    <span className="font-display font-bold text-primary text-xl">
                      {founder.name.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="font-display font-bold uppercase text-foreground text-lg">
                  {founder.name}
                </h3>
                {founder.nickname && (
                  <p className="text-primary text-sm font-display uppercase tracking-wider mt-1">
                    "{founder.nickname}"
                  </p>
                )}
                <p className="text-muted-foreground text-sm uppercase tracking-wider mt-1 mb-4">
                  {founder.title} · {founder.location}
                </p>
                <p className="text-muted-foreground leading-relaxed">{founder.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-card">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              <img
                src={wellnessCycling}
                alt="Wellness through cycling"
                className="w-full h-auto rounded-sm object-cover aspect-[4/3]"
              />
              <div className="absolute -top-4 -right-4 w-28 h-28 border-4 border-primary rounded-sm -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
                What Drives Us
              </span>
              <h2 className="font-display font-bold uppercase text-3xl md:text-4xl text-foreground mb-8">
                OUR CORE <span className="text-outline">VALUES</span>
              </h2>
              <div className="space-y-6">
                {coreValues.map((value, index) => (
                  <motion.div
                    key={value.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2.5" />
                    <div>
                      <h4 className="font-display uppercase tracking-wider text-foreground font-bold text-sm mb-1">
                        {value.label}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
