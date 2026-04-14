import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Heart, ClipboardList, UserCheck } from 'lucide-react';

const steps = [
  {
    icon: UserCheck,
    title: 'Create Account',
    desc: 'Sign up for a free account to get started with your application.',
  },
  {
    icon: ClipboardList,
    title: 'Submit Application',
    desc: 'Fill out the application form with your information and goals.',
  },
  {
    icon: Heart,
    title: 'Get Matched',
    desc: 'Our team reviews and selects three recipients for free therapy.',
  },
];

export default function CycleOfSupportLanding() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center bg-secondary py-24 px-6">
        <div className="max-w-3xl w-full text-center">
          <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
            Keep Pedaling Foundation
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-black uppercase text-foreground mb-6 leading-none">
            CYCLE OF <span className="text-outline">SUPPORT</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-4 leading-relaxed">
            The Keep Pedaling Foundation offers <strong className="text-foreground">free therapy for one month</strong> to three selected individuals who are ready to begin their healing journey.
          </p>
          <p className="text-sm text-primary font-display uppercase tracking-wider mb-10">
            Applications reviewed on a rolling basis
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to="/cycle-of-support/apply"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider px-8 py-4 hover:bg-primary/90 transition-colors"
              >
                Apply Now →
              </Link>
            ) : (
              <>
                <Link
                  to="/cycle-of-support/signup"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider px-8 py-4 hover:bg-primary/90 transition-colors"
                >
                  Get Started →
                </Link>
                <Link
                  to="/cycle-of-support/login"
                  className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-display text-sm uppercase tracking-wider px-8 py-4 hover:bg-muted transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
              The Process
            </span>
            <h2 className="font-display text-4xl font-black uppercase text-foreground">
              HOW IT <span className="text-outline">WORKS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="bg-card border border-border p-8 rounded-sm text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-sm flex items-center justify-center mx-auto mb-6">
                  <step.icon size={32} className="text-primary" />
                </div>
                <div className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Step {i + 1}
                </div>
                <h3 className="font-display text-lg font-bold uppercase text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
