import { useState } from 'react';
import { Facebook, Instagram } from 'lucide-react';
import { useSiteContent } from '@/lib/site-content';

export const StayConnected = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { content } = useSiteContent();
  const contact = content.contact;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
        }),
      });
      if (!res.ok) throw new Error('Failed to subscribe');
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-background py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <h2
          className="font-black uppercase text-primary leading-none mb-10"
          style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', letterSpacing: '-0.02em' }}
        >
          {contact.stayConnectedTitle}
        </h2>

        {sent ? (
          <p className="text-foreground text-xl">{contact.stayConnectedSuccessMessage}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
            <label htmlFor="sc-first-name" className="sr-only">First Name</label>
            <input
              id="sc-first-name"
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              required
              className="flex-1 bg-transparent border-b border-muted-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary py-3 text-base transition-colors"
            />
            <label htmlFor="sc-last-name" className="sr-only">Last Name</label>
            <input
              id="sc-last-name"
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              required
              className="flex-1 bg-transparent border-b border-muted-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary py-3 text-base transition-colors"
            />
            <label htmlFor="sc-email" className="sr-only">Email Address</label>
            <input
              id="sc-email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              className="flex-1 bg-transparent border-b border-muted-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary py-3 text-base transition-colors"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-primary-foreground font-bold uppercase tracking-widest px-8 py-3 hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : contact.stayConnectedButtonLabel}
            </button>
          </form>
        )}

        {error && <p className="text-destructive text-sm mb-6">{error}</p>}

        <div className="flex items-center gap-6 mt-6">
          <a
            href={contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={28} />
          </a>
          <a
            href={contact.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Facebook"
          >
            <Facebook size={28} />
          </a>
        </div>
      </div>
    </section>
  );
};
