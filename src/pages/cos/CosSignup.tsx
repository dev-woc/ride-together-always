import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function CosSignup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone, password: data.password }),
    });
    const json = await res.json();
    if (!res.ok) { setServerError(json.error); return; }
    login(json.token, json.user);
    navigate('/cycle-of-support/apply');
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/cycle-of-support" className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-2 block hover:underline">
            ← Cycle of Support
          </Link>
          <h1 className="font-display text-3xl font-black uppercase text-foreground">
            CREATE ACCOUNT
          </h1>
        </div>

        <div className="bg-card border border-border rounded-sm p-8">
          {serverError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-sm mb-6">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Field label="Full Name" error={errors.name?.message}>
              <input {...register('name')} placeholder="Jordan Mason" className={inputCls(!!errors.name)} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" placeholder="you@example.com" className={inputCls(!!errors.email)} />
            </Field>
            <Field label="Phone (optional)" error={errors.phone?.message}>
              <input {...register('phone')} type="tel" placeholder="(407) 555-0100" className={inputCls(!!errors.phone)} />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <input {...register('password')} type="password" placeholder="••••••••" className={inputCls(!!errors.password)} />
            </Field>
            <Field label="Confirm Password" error={errors.confirmPassword?.message}>
              <input {...register('confirmPassword')} type="password" placeholder="••••••••" className={inputCls(!!errors.confirmPassword)} />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider py-3 hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/cycle-of-support/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-display text-xs uppercase tracking-wider text-foreground mb-2">{label}</label>
      {children}
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full bg-background border ${hasError ? 'border-destructive' : 'border-border'} px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors rounded-sm`;
}
