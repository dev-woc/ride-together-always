import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactModal = ({ open, onOpenChange }: Props) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const inputClass =
    'w-full bg-transparent border-b border-muted-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary py-3 text-base transition-colors';

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setStatus('idle'); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wider text-xl">Contact Us</DialogTitle>
        </DialogHeader>

        {status === 'success' ? (
          <div className="py-8 text-center">
            <p className="text-foreground text-lg font-medium">Message received!</p>
            <p className="text-muted-foreground mt-2">We'll be in touch with you soon.</p>
            <Button className="mt-6 font-display uppercase tracking-wider" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
            <label htmlFor="contact-name" className="sr-only">Full Name</label>
            <input
              id="contact-name"
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              className={inputClass}
            />
            <label htmlFor="contact-email" className="sr-only">Email Address</label>
            <input
              id="contact-email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              className={inputClass}
            />
            <label htmlFor="contact-phone" className="sr-only">Phone Number (optional)</label>
            <input
              id="contact-phone"
              type="tel"
              placeholder="Phone Number (optional)"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className={inputClass}
            />
            <label htmlFor="contact-message" className="sr-only">How can we help you?</label>
            <textarea
              id="contact-message"
              placeholder="How can we help you?"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              required
              rows={4}
              className="w-full bg-transparent border-b border-muted-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary py-3 text-base transition-colors resize-none"
            />
            {status === 'error' && (
              <p className="text-destructive text-sm">Something went wrong. Please try again.</p>
            )}
            <Button
              type="submit"
              disabled={status === 'loading'}
              className="font-display uppercase tracking-wider mt-2"
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
