import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { useUploadThing } from '@/lib/uploadthing';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CheckCircle, UploadCloud, X } from 'lucide-react';

const CHALLENGES = ['Anxiety', 'Depression', 'Relationship Issues', 'Grief & Loss', 'Career Stress', 'Trauma', 'Other'];

const schema = z.object({
  full_name: z.string().min(2, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Required'),
  date_of_birth: z.string().min(1, 'Required'),
  city_state: z.string().min(2, 'Required'),
  prior_therapy: z.enum(['true', 'false'], { required_error: 'Required' }),
  has_insurance: z.enum(['true', 'false'], { required_error: 'Required' }),
  current_challenges: z.array(z.string()).min(1, 'Select at least one'),
  mental_health_description: z.string().min(20, 'Please provide more detail'),
  therapy_motivation: z.string().min(20, 'Please provide more detail'),
  therapy_goals: z.string().min(20, 'Please provide more detail'),
  therapy_barriers: z.string().min(10, 'Please provide more detail'),
  weekly_commitment: z.enum(['true', 'false'], { required_error: 'Required' }),
  has_device: z.enum(['true', 'false'], { required_error: 'Required' }),
  testimonial_willing: z.enum(['true', 'false'], { required_error: 'Required' }),
  therapist_preference: z.enum(['foundation', 'own'], { required_error: 'Required' }),
  preferred_therapist_name: z.string().optional(),
  preferred_therapist_contact: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CosApply() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checkingApp, setCheckingApp] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing('introVideo', {
    onUploadProgress: (p) => setUploadProgress(p),
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) setVideoUrl(res[0].url);
      setUploadProgress(100);
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.email ?? '',
      full_name: user?.name ?? '',
      current_challenges: [],
    },
  });

  const therapistPref = watch('therapist_preference');

  useEffect(() => {
    fetch('/api/applications', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.application) setAlreadyApplied(true); })
      .finally(() => setCheckingApp(false));
  }, [token]);

  const onSubmit = async (data: FormData) => {
    setServerError('');

    let uploadedVideoUrl = videoUrl;
    if (videoFile && !videoUrl) {
      const uploaded = await startUpload([videoFile]);
      uploadedVideoUrl = uploaded?.[0]?.url ?? null;
    }

    const payload = {
      ...data,
      prior_therapy: data.prior_therapy === 'true',
      has_insurance: data.has_insurance === 'true',
      weekly_commitment: data.weekly_commitment === 'true',
      has_device: data.has_device === 'true',
      testimonial_willing: data.testimonial_willing === 'true',
      intro_video_url: uploadedVideoUrl,
    };

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) { setServerError(json.error); return; }
    navigate('/cycle-of-support/dashboard');
  };

  if (checkingApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-6">
        <div className="bg-card border border-border rounded-sm p-12 text-center max-w-md">
          <CheckCircle size={48} className="text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold uppercase text-foreground mb-3">Application Submitted</h2>
          <p className="text-muted-foreground mb-6">You've already submitted an application. Check your dashboard for status updates.</p>
          <Link to="/cycle-of-support/dashboard" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider px-6 py-3 hover:bg-primary/90 transition-colors">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12">
            <Link to="/cycle-of-support" className="font-display text-sm uppercase tracking-wider text-primary hover:underline">
              ← Cycle of Support
            </Link>
            <h1 className="font-display text-4xl font-black uppercase text-foreground mt-4">
              APPLICATION
            </h1>
            <p className="text-muted-foreground mt-2">All fields are required unless marked optional.</p>
          </div>

          {serverError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-sm mb-8">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Personal Info */}
            <Section title="Personal Information">
              <Field label="Full Name" error={errors.full_name?.message}>
                <input {...register('full_name')} className={inputCls(!!errors.full_name)} placeholder="Jordan Mason" />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input {...register('email')} type="email" className={inputCls(!!errors.email)} />
              </Field>
              <Field label="Phone Number" error={errors.phone?.message}>
                <input {...register('phone')} type="tel" className={inputCls(!!errors.phone)} placeholder="(407) 555-0100" />
              </Field>
              <Field label="Date of Birth" error={errors.date_of_birth?.message}>
                <input {...register('date_of_birth')} type="date" className={inputCls(!!errors.date_of_birth)} />
              </Field>
              <Field label="City, State" error={errors.city_state?.message}>
                <input {...register('city_state')} className={inputCls(!!errors.city_state)} placeholder="Orlando, FL" />
              </Field>
            </Section>

            {/* Therapy Background */}
            <Section title="Therapy Background">
              <RadioField label="Have you previously received therapy or counseling?" name="prior_therapy" register={register} error={errors.prior_therapy?.message} />
              <RadioField label="Do you currently have active health insurance?" name="has_insurance" register={register} error={errors.has_insurance?.message} />

              <div>
                <label className="block font-display text-xs uppercase tracking-wider text-foreground mb-3">
                  Current Challenges <span className="text-muted-foreground normal-case">(select all that apply)</span>
                </label>
                <Controller
                  control={control}
                  name="current_challenges"
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {CHALLENGES.map(c => (
                        <label key={c} className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <input
                            type="checkbox"
                            className="accent-primary"
                            checked={field.value?.includes(c)}
                            onChange={e => {
                              const next = e.target.checked
                                ? [...(field.value ?? []), c]
                                : (field.value ?? []).filter(v => v !== c);
                              field.onChange(next);
                            }}
                          />
                          {c}
                        </label>
                      ))}
                    </div>
                  )}
                />
                {errors.current_challenges && <p className="text-destructive text-xs mt-1">{errors.current_challenges.message}</p>}
              </div>
            </Section>

            {/* Mental Health & Goals */}
            <Section title="Mental Health & Goals">
              <TextareaField label="Describe your current mental and emotional health" name="mental_health_description" register={register} error={errors.mental_health_description?.message} />
              <TextareaField label="Why are you seeking therapy at this time?" name="therapy_motivation" register={register} error={errors.therapy_motivation?.message} />
              <TextareaField label="What are your therapy goals?" name="therapy_goals" register={register} error={errors.therapy_goals?.message} />
              <TextareaField label="What barriers have prevented you from accessing therapy?" name="therapy_barriers" register={register} error={errors.therapy_barriers?.message} />
            </Section>

            {/* Logistics */}
            <Section title="Logistics">
              <RadioField label="Can you commit to weekly therapy sessions?" name="weekly_commitment" register={register} error={errors.weekly_commitment?.message} />
              <RadioField label="Do you have a device for virtual sessions?" name="has_device" register={register} error={errors.has_device?.message} />
              <RadioField label="Are you willing to share a testimonial if selected?" name="testimonial_willing" register={register} error={errors.testimonial_willing?.message} />
            </Section>

            {/* Therapist Preference */}
            <Section title="Therapist Preference">
              <div>
                <label className="block font-display text-xs uppercase tracking-wider text-foreground mb-3">
                  How would you like to be matched with a therapist?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'foundation', label: 'Let the KPF team find a therapist for me' },
                    { value: 'own', label: 'I have a preferred therapist in mind' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <input type="radio" value={opt.value} {...register('therapist_preference')} className="accent-primary" />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {errors.therapist_preference && <p className="text-destructive text-xs mt-1">{errors.therapist_preference.message}</p>}
              </div>

              {therapistPref === 'own' && (
                <div className="space-y-4 pt-2">
                  <Field label="Therapist Name" error={errors.preferred_therapist_name?.message}>
                    <input {...register('preferred_therapist_name')} className={inputCls(!!errors.preferred_therapist_name)} />
                  </Field>
                  <Field label="Therapist Contact Info" error={errors.preferred_therapist_contact?.message}>
                    <input {...register('preferred_therapist_contact')} className={inputCls(!!errors.preferred_therapist_contact)} />
                  </Field>
                </div>
              )}
            </Section>

            {/* Introduction Video */}
            <Section title="Introduction Video (Optional)">
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Record a short video (up to 32MB) introducing yourself and explaining your therapy goals. This is optional but helps us learn more about you.
              </p>

              {videoUrl ? (
                <div className="flex items-center gap-3 bg-background border border-border rounded-sm px-4 py-3">
                  <CheckCircle size={18} className="text-green-500 shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1">Video uploaded successfully</span>
                  <button
                    type="button"
                    onClick={() => { setVideoUrl(null); setVideoFile(null); setUploadProgress(0); }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : videoFile ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-background border border-border rounded-sm px-4 py-3">
                    <UploadCloud size={18} className="text-primary shrink-0" />
                    <span className="text-sm text-foreground truncate flex-1">{videoFile.name}</span>
                    <button
                      type="button"
                      onClick={() => { setVideoFile(null); setUploadProgress(0); }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {isUploading && (
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-sm py-10 cursor-pointer hover:border-primary transition-colors group">
                  <UploadCloud size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Click to select a video file
                  </span>
                  <span className="text-xs text-muted-foreground">MP4, MOV, WebM — max 32MB</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setVideoFile(file);
                    }}
                  />
                </label>
              )}
            </Section>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider py-4 hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isUploading ? `Uploading video… ${uploadProgress}%` : isSubmitting ? 'Submitting…' : 'Submit Application →'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-sm p-6 space-y-5">
      <h2 className="font-display text-sm uppercase tracking-[0.2em] text-primary border-b border-border pb-3">
        {title}
      </h2>
      {children}
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

function RadioField({ label, name, register, error }: { label: string; name: string; register: any; error?: string }) {
  return (
    <div>
      <label className="block font-display text-xs uppercase tracking-wider text-foreground mb-3">{label}</label>
      <div className="flex gap-6">
        {[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }].map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            <input type="radio" value={opt.value} {...register(name)} className="accent-primary" />
            {opt.label}
          </label>
        ))}
      </div>
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
}

function TextareaField({ label, name, register, error }: { label: string; name: string; register: any; error?: string }) {
  return (
    <Field label={label} error={error}>
      <textarea
        {...register(name)}
        rows={4}
        className={`w-full bg-background border ${error ? 'border-destructive' : 'border-border'} px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors rounded-sm resize-none`}
      />
    </Field>
  );
}

function inputCls(hasError: boolean) {
  return `w-full bg-background border ${hasError ? 'border-destructive' : 'border-border'} px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors rounded-sm`;
}
