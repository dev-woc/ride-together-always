import { useState } from 'react';
import { Facebook, Instagram } from 'lucide-react';

export const StayConnected = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="bg-background py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <h2
          className="font-black uppercase text-primary leading-none mb-10"
          style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', letterSpacing: '-0.02em' }}
        >
          Stay Connected
        </h2>

        {sent ? (
          <p className="text-foreground text-xl">Thanks! We'll be in touch.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-10">
            <input
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              required
              className="flex-1 bg-transparent border-b border-muted-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary py-3 text-base transition-colors"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              required
              className="flex-1 bg-transparent border-b border-muted-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary py-3 text-base transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              className="flex-1 bg-transparent border-b border-muted-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary py-3 text-base transition-colors"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground font-bold uppercase tracking-widest px-8 py-3 hover:opacity-90 transition-opacity text-sm"
            >
              Send
            </button>
          </form>
        )}

        <div className="flex items-center gap-6">
          <a
            href="https://www.instagram.com/keeppedalingfoundation/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={28} />
          </a>
          <a
            href="https://www.facebook.com/people/Keep-Pedaling-Foundation/61565706314697/"
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
