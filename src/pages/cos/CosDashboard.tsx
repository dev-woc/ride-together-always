import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Clock, CheckCircle, XCircle, Eye, LogOut } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  reviewing: { label: 'Under Review', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
  rejected: { label: 'Not Selected', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
} as const;

export default function CosDashboard() {
  const { user, token, logout } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/applications', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setApplication(data.application))
      .finally(() => setLoading(false));
  }, [token]);

  const status = application?.status ?? 'pending';
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="font-display text-sm uppercase tracking-[0.3em] text-primary block mb-1">
                Cycle of Support
              </span>
              <h1 className="font-display text-4xl font-black uppercase text-foreground">
                MY DASHBOARD
              </h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !application ? (
            <div className="bg-card border border-border rounded-sm p-12 text-center">
              <h2 className="font-display text-xl font-bold uppercase text-foreground mb-3">No Application Yet</h2>
              <p className="text-muted-foreground mb-8">You haven't submitted an application. Apply now to be considered for free therapy.</p>
              <Link
                to="/cycle-of-support/apply"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider px-6 py-3 hover:bg-primary/90 transition-colors"
              >
                Apply Now →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Card */}
              <div className={`border rounded-sm p-6 ${cfg.bg}`}>
                <div className="flex items-center gap-3">
                  <StatusIcon size={24} className={cfg.color} />
                  <div>
                    <div className="font-display text-xs uppercase tracking-wider text-muted-foreground">Application Status</div>
                    <div className={`font-display text-lg font-bold uppercase ${cfg.color}`}>{cfg.label}</div>
                  </div>
                </div>
                {status === 'pending' && (
                  <p className="text-sm text-muted-foreground mt-3">Your application has been received and is in queue for review. We'll update you when there's a change.</p>
                )}
                {status === 'reviewing' && (
                  <p className="text-sm text-muted-foreground mt-3">Our team is actively reviewing your application. This usually takes 1–2 weeks.</p>
                )}
                {status === 'approved' && (
                  <p className="text-sm text-muted-foreground mt-3">Congratulations! You've been selected. A team member will reach out to you at {application.email} within 48 hours.</p>
                )}
                {status === 'rejected' && (
                  <p className="text-sm text-muted-foreground mt-3">Thank you for applying. We weren't able to select you in this cycle, but we encourage you to apply again in future rounds.</p>
                )}
              </div>

              {/* Application Summary */}
              <div className="bg-card border border-border rounded-sm p-6 space-y-4">
                <h2 className="font-display text-sm uppercase tracking-[0.2em] text-foreground border-b border-border pb-3">
                  Application Summary
                </h2>
                <SummaryRow label="Name" value={application.full_name} />
                <SummaryRow label="Email" value={application.email} />
                <SummaryRow label="Phone" value={application.phone} />
                <SummaryRow label="City / State" value={application.city_state} />
                <SummaryRow label="Challenges" value={application.current_challenges?.join(', ')} />
                <SummaryRow label="Therapist Preference" value={application.therapist_preference === 'foundation' ? 'KPF matched' : 'Own therapist'} />
                <SummaryRow
                  label="Submitted"
                  value={new Date(application.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 text-sm">
      <span className="font-display text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{label}</span>
      <span className="text-foreground text-right">{value || '—'}</span>
    </div>
  );
}
